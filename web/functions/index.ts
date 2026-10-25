/**
 * Cloudflare Pages Function for `/` only: redirects to /ka, /ru or /en by Accept-Language.
 * Georgian is the default. Other paths are served as static prerendered files.
 */
const LANGS = ['ka', 'ru', 'en'] as const;
type Lang = (typeof LANGS)[number];

function pickLang(header: string | null): Lang {
  const prefs = (header ?? '')
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return (prefs.find((p) => (LANGS as readonly string[]).includes(p.lang))?.lang as Lang) ?? 'ka';
}

export const onRequestGet = ({ request }: { request: Request }): Response => {
  const url = new URL(request.url);
  url.pathname = `/${pickLang(request.headers.get('Accept-Language'))}/`;
  return new Response(null, {
    status: 302,
    headers: { Location: url.toString(), Vary: 'Accept-Language', 'Cache-Control': 'private, max-age=0' },
  });
};
