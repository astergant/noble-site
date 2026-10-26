/** Keep in sync with api/src/providers/sheets.ts (Pages Function cannot import the API package). */

export interface SheetsEnv {
  GOOGLE_SHEET_ID?: string;
  GOOGLE_SHEET_TAB?: string;
  GOOGLE_CLIENT_EMAIL?: string;
  GOOGLE_PRIVATE_KEY?: string;
  GOOGLE_SHEETS_WEBHOOK?: string;
  GOOGLE_SHEETS_TOKEN?: string;
}

export interface SheetLead {
  name: string;
  phone: string;
  service?: string;
  source: string;
  lang: string;
}

export function sheetsEnabled(env: SheetsEnv): boolean {
  return Boolean(
    (env.GOOGLE_SHEETS_WEBHOOK && env.GOOGLE_SHEETS_TOKEN) ||
      (env.GOOGLE_SHEET_ID && env.GOOGLE_CLIENT_EMAIL && env.GOOGLE_PRIVATE_KEY),
  );
}

function tbilisiStamp(date = new Date()): string {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Asia/Tbilisi',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(date)
    .replace(',', '');
}

/** Sheet «Заявки»: A datetime, B name, C phone, D–G empty, H service, I–J empty, K status. */
export function sheetRow(lead: SheetLead, at = new Date()): string[] {
  return [
    tbilisiStamp(at),
    lead.name,
    lead.phone,
    '',
    '',
    '',
    '',
    lead.service ?? '',
    '',
    '',
    'Новая',
  ];
}

function pemToDer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/\\n/g, '\n')
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function b64url(bytes: Uint8Array | string): string {
  const raw =
    typeof bytes === 'string'
      ? btoa(bytes)
      : btoa(String.fromCharCode(...bytes));
  return raw.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function googleAccessToken(email: string, pem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(
    JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToDer(pem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${b64url(new Uint8Array(sig))}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Google token ${res.status}`);
  const body = (await res.json()) as { access_token?: string };
  if (!body.access_token) throw new Error('Google token missing');
  return body.access_token;
}

export async function appendLead(env: SheetsEnv, lead: SheetLead): Promise<void> {
  const row = sheetRow(lead);
  if (env.GOOGLE_SHEETS_WEBHOOK && env.GOOGLE_SHEETS_TOKEN) {
    const res = await fetch(env.GOOGLE_SHEETS_WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: env.GOOGLE_SHEETS_TOKEN, row, ...lead }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Sheets webhook ${res.status}`);
    return;
  }
  const token = await googleAccessToken(env.GOOGLE_CLIENT_EMAIL!, env.GOOGLE_PRIVATE_KEY!);
  const tab = env.GOOGLE_SHEET_TAB || 'Заявки';
  const range = encodeURIComponent(`${tab}!A:K`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ values: [row] }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Sheets append ${res.status}`);
}
