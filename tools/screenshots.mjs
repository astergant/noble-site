#!/usr/bin/env node
/**
 * Visual check: screenshots of key pages in every language at 360 / 768 / 1280 px,
 * using the locally installed Microsoft Edge (no browser download).
 * Usage: node tools/screenshots.mjs [baseUrl] [outDir] [--pages=/,/services] [--widths=360,1280] [--langs=ka,ru]
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const opt = (name, def) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1]?.split(',') ?? def;
const [base = 'http://localhost:4200', out = 'docs/screenshots/latest'] = args.filter((a) => !a.startsWith('--'));
const pages = opt('pages', ['/', '/services/ppf-risk-zones', '/prices']);
const widths = opt('widths', ['360', '768', '1280']).map(Number);
const langs = opt('langs', ['ka', 'ru', 'en']);
const full = args.includes('--full');

mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge' });
const errors = [];

for (const width of widths) {
  const mobile = width < 768;
  const context = await browser.newContext({
    viewport: { width, height: mobile ? 780 : 900 },
    deviceScaleFactor: mobile ? 2 : 1,
    isMobile: mobile,
    hasTouch: mobile,
    // Full-page shots never scroll, so reveal-on-scroll would leave sections hidden.
    reducedMotion: 'reduce',
  });
  // Hide the cookie banner for clean screenshots.
  await context.addInitScript(() => localStorage.setItem('noble.consent.v1', 'denied'));
  for (const lang of langs) {
    for (const p of pages) {
      const page = await context.newPage();
      page.on('pageerror', (e) => errors.push(`${lang}${p} @${width}: ${e.message}`));
      page.on('console', (m) => m.type() === 'error' && errors.push(`${lang}${p} @${width}: ${m.text()}`));
      // Not networkidle: the Yandex map iframe keeps the network busy.
      await page.goto(`${base}/${lang}${p === '/' ? '' : p}`, { waitUntil: 'load' });
      await page.waitForTimeout(800);
      // Compare with the requested width: on mobile emulation innerWidth grows with the overflow itself.
      const overflow = await page.evaluate((w) => document.documentElement.scrollWidth - w, width);
      if (overflow > 0) errors.push(`${lang}${p} @${width}: horizontal overflow ${overflow}px`);
      const file = join(out, `${lang}${p === '/' ? '-home' : p.replaceAll('/', '-')}-${width}.png`);
      await page.screenshot({ path: file, fullPage: full });
      await page.close();
      console.log('saved', file);
    }
  }
  await context.close();
}

await browser.close();
if (errors.length) {
  console.error('\nIssues:\n' + errors.map((e) => '  - ' + e).join('\n'));
  process.exitCode = 1;
}
