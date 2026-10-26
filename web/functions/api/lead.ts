import { appendLead, sheetsEnabled, type SheetsEnv } from '../_lib/sheets';

const LANGS = new Set(['ka', 'ru', 'en']);
const hits = new Map<string, { n: number; reset: number }>();

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

function normalizePhone(raw: string): string | null {
  let p = raw.trim().replace(/[\s()-]/g, '');
  if (/^5\d{8}$/.test(p)) p = `+995${p}`;
  if (/^995\d{9}$/.test(p)) p = `+${p}`;
  return /^\+?\d{8,15}$/.test(p) ? p : null;
}

function limited(ip: string): boolean {
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || cur.reset < now) {
    hits.set(ip, { n: 1, reset: now + 15 * 60_000 });
    return false;
  }
  cur.n += 1;
  return cur.n > 5;
}

export const onRequestPost = async ({
  request,
  env,
}: {
  request: Request;
  env: SheetsEnv;
}): Promise<Response> => {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (limited(ip)) return json({ ok: false, error: 'rate_limited' }, 429);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'validation' }, 400);
  }

  if (typeof body.noble_hp === 'string' && body.noble_hp.length) return json({ ok: true });

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const phone = typeof body.phone === 'string' ? normalizePhone(body.phone) : null;
  const lang = typeof body.lang === 'string' ? body.lang : '';
  const source = typeof body.source === 'string' ? body.source.trim() : '';
  const service = typeof body.service === 'string' ? body.service.trim().slice(0, 80) : '';
  if (
    name.length < 2 ||
    name.length > 80 ||
    !phone ||
    !LANGS.has(lang) ||
    !source ||
    source.length > 40 ||
    body.consent !== true
  ) {
    return json({ ok: false, error: 'validation' }, 400);
  }

  if (!sheetsEnabled(env)) {
    console.error('lead.sheets_missing', {
      sheet: Boolean(env.GOOGLE_SHEET_ID),
      email: Boolean(env.GOOGLE_CLIENT_EMAIL),
      key: Boolean(env.GOOGLE_PRIVATE_KEY),
      saJson: Boolean(env.GOOGLE_SA_JSON),
    });
    return json({ ok: false, error: 'delivery' }, 503);
  }

  try {
    await appendLead(env, { name, phone, lang, source, service: service || undefined });
  } catch (err) {
    console.error('lead.sheets_failed', String(err));
    return json({ ok: false, error: 'delivery' }, 502);
  }
  return json({ ok: true });
};
