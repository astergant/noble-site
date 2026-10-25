import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JWT } from 'google-auth-library';
import type { Config } from '../config.js';
import { logger } from '../logger.js';
import type { Lead } from '../schemas.js';
import type { LeadRepository, StoredLead } from './types.js';

const TBILISI = 'Asia/Tbilisi';
const API_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SA_FILE = join(API_ROOT, 'google-sa.json');

type ServiceAccount = { client_email: string; private_key: string };

export function sheetsEnabled(config: Config): boolean {
  if (!config.GOOGLE_SHEET_ID) return false;
  return Boolean(loadAccount(config));
}

function loadAccount(config: Config): ServiceAccount | null {
  if (existsSync(SA_FILE)) {
    const parsed = JSON.parse(readFileSync(SA_FILE, 'utf8')) as Partial<ServiceAccount>;
    if (parsed.client_email && parsed.private_key) {
      return { client_email: parsed.client_email, private_key: parsed.private_key };
    }
  }
  if (config.GOOGLE_CLIENT_EMAIL && config.GOOGLE_PRIVATE_KEY) {
    return {
      client_email: config.GOOGLE_CLIENT_EMAIL,
      private_key: config.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }
  return null;
}

function tbilisiStamp(date = new Date()): string {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: TBILISI,
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

/** Columns A–I on Лист1. */
export function sheetRow(lead: Lead, at: Date): string[] {
  const stamp = tbilisiStamp(at);
  const kind = lead.source === 'popup_discount' ? 'скидка 10%' : 'консультация';
  return [
    'заявка с сайта',
    lead.name,
    '',
    lead.phone,
    lead.lang,
    stamp,
    stamp,
    lead.service ?? '',
    kind,
  ];
}

async function appendViaApi(config: Config, row: string[]): Promise<void> {
  const sa = loadAccount(config);
  if (!sa || !config.GOOGLE_SHEET_ID) throw new Error('Google Sheets is not configured');
  const jwt = new JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const creds = await jwt.authorize();
  const token = creds.access_token;
  if (!token) throw new Error('Google token missing');
  const tab = config.GOOGLE_SHEET_TAB;
  const range = encodeURIComponent(`${tab}!A:I`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.GOOGLE_SHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  let last: unknown;
  for (let i = 0; i < 2; i++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ values: [row] }),
        signal: AbortSignal.timeout(25_000),
      });
      if (!res.ok) {
        const body = (await res.text()).slice(0, 300);
        throw new Error(`Sheets append ${res.status} ${body}`);
      }
      return;
    } catch (err) {
      last = err;
    }
  }
  throw last instanceof Error ? last : new Error(String(last));
}

/** Appends a lead as a new row on Лист1. Does not store personal data on this server. */
export class SheetsLeadRepository implements LeadRepository {
  constructor(private readonly config: Config) {}

  async save(lead: Lead): Promise<StoredLead> {
    const stored: StoredLead = { ...lead, id: randomUUID(), createdAt: new Date().toISOString() };
    await appendViaApi(this.config, sheetRow(lead, new Date(stored.createdAt)));
    logger.info('lead.sheet_ok', { id: stored.id, source: stored.source, lang: stored.lang });
    return stored;
  }
}
