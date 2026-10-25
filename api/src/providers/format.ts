import type { StoredLead } from './types.js';

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function leadLines(lead: StoredLead): [string, string][] {
  const rows: [string, string | undefined][] = [
    ['Имя', lead.name],
    ['Телефон', lead.phone],
    ['Услуга', lead.service],
    ['Автомобиль', lead.car],
    ['Комментарий', lead.comment],
    ['Язык', lead.lang],
    ['Источник', lead.source],
    ['UTM', lead.utm && Object.entries(lead.utm).map(([k, v]) => `${k}=${v}`).join(', ')],
  ];
  return rows.filter((r): r is [string, string] => Boolean(r[1]));
}

export function leadHtml(lead: StoredLead): string {
  const body = leadLines(lead)
    .map(([k, v]) => `<b>${k}:</b> ${escapeHtml(v)}`)
    .join('\n');
  return `<b>Новая заявка с сайта</b> #${lead.id.slice(0, 8)}\n${body}`;
}

export function leadText(lead: StoredLead): string {
  return [`Новая заявка с сайта #${lead.id.slice(0, 8)}`, ...leadLines(lead).map(([k, v]) => `${k}: ${v}`)].join('\n');
}
