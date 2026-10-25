#!/usr/bin/env node
/**
 * After `ng build`: writes sitemap.xml (with hreflang alternates), robots.txt and 404.html
 * into web/dist/web/browser, based on the prerendered folders.
 * Usage: node tools/postbuild.mjs
 */
import { copyFileSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'web/dist/web/browser');
const site = JSON.parse(readFileSync(join(root, 'web/src/app/data/site.json'), 'utf8'));
const LANGS = ['ka', 'ru', 'en'];
const DEFAULT_LANG = 'ka';
const EXCLUDE = new Set(['404', 'book']);

if (!existsSync(out)) {
  console.error(`postbuild: ${out} not found, run ng build first`);
  process.exit(1);
}

/** Paths (without language) that have a prerendered index.html, e.g. '', 'services/ppf-full'. */
function pages(lang) {
  const base = join(out, lang);
  const found = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name === 'index.html') found.push(relative(base, dir).split(sep).join('/'));
    }
  };
  if (existsSync(base)) walk(base);
  return found.filter((p) => !EXCLUDE.has(p.split('/')[0])).sort();
}

const byLang = Object.fromEntries(LANGS.map((l) => [l, new Set(pages(l))]));
const all = [...new Set(LANGS.flatMap((l) => [...byLang[l]]))].sort();
/** Must match SeoService.url (canonical): trailing slash. */
const url = (lang, path) => `${site.siteUrl}/${lang}/${path ? `${path}/` : ''}`;
const today = new Date().toISOString().slice(0, 10);

const entries = [];
for (const path of all) {
  const langs = LANGS.filter((l) => byLang[l].has(path));
  const alternates = [
    ...langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l, path)}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${url(langs.includes(DEFAULT_LANG) ? DEFAULT_LANG : langs[0], path)}"/>`,
  ].join('\n');
  for (const l of langs) {
    entries.push(`  <url>\n    <loc>${url(l, path)}</loc>\n    <lastmod>${today}</lastmod>\n${alternates}\n  </url>`);
  }
}

writeFileSync(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`,
);

writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.siteUrl}/sitemap.xml\n`);

const notFound = join(out, DEFAULT_LANG, '404', 'index.html');
if (existsSync(notFound)) copyFileSync(notFound, join(out, '404.html'));

console.log(`postbuild: sitemap.xml (${entries.length} urls), robots.txt${existsSync(notFound) ? ', 404.html' : ''}`);
