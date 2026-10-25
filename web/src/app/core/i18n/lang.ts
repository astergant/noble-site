export const LANGS = ['ka', 'ru', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export type L10n = Record<Lang, string>;

export const DEFAULT_LANG: Lang = 'ka';

/** BCP 47 tags for `<html lang>`, Open Graph and hreflang. */
export const LANG_LOCALE: Record<Lang, string> = { ka: 'ka_GE', ru: 'ru_RU', en: 'en_US' };

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

/** Picks the best supported language from an Accept-Language header or navigator.languages. */
export function pickLang(preferred: string | readonly string[] | null | undefined): Lang {
  if (!preferred) return DEFAULT_LANG;
  const tags =
    typeof preferred === 'string'
      ? preferred
          .split(',')
          .map((part) => {
            const [tag, ...params] = part.trim().split(';');
            const q = params.find((p) => p.trim().startsWith('q='));
            return { tag: tag!.toLowerCase(), q: q ? Number(q.trim().slice(2)) || 0 : 1 };
          })
          .sort((a, b) => b.q - a.q)
          .map((t) => t.tag)
      : preferred.map((t) => t.toLowerCase());

  for (const tag of tags) {
    const base = tag.split('-')[0];
    if (isLang(base)) return base;
  }
  return DEFAULT_LANG;
}
