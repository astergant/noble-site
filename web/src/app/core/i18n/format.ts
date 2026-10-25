import type { Currency, Lang } from '../models';

/**
 * Deterministic number/price formatting (identical on server and in every browser,
 * so hydration never sees a different string than prerender produced).
 */
export function formatNumber(value: number, lang: Lang): string {
  const sep = lang === 'en' ? ',' : '\u00A0';
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

/** One decimal place, e.g. a rating: 4,9 (ka, ru) / 4.9 (en). */
export function formatRating(value: number, lang: Lang): string {
  const s = value.toFixed(1);
  return lang === 'en' ? s : s.replace('.', ',');
}

const MONTHS: Record<Lang, string[]> = {
  ka: ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

/** ISO date (YYYY-MM-DD) → "7 октября 2026" / "7 ოქტომბერი, 2026" / "7 October 2026", without Intl differences. */
export function formatDate(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split('-').map(Number);
  const month = MONTHS[lang][m - 1];
  return lang === 'ka' ? `${d} ${month}, ${y}` : `${d} ${month} ${y}`;
}

export function formatMoney(value: number, currency: Currency, lang: Lang): string {
  const n = formatNumber(value, lang);
  return currency === 'USD' ? `$${n}` : `${n}\u00A0₾`;
}
