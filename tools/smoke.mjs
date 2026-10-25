#!/usr/bin/env node
/**
 * Interactive smoke checks in local Edge: mobile menu, focus handling, language switch
 * keeps the page, cookie banner, 404. Usage: node tools/smoke.mjs [baseUrl]
 */
import { chromium } from 'playwright-core';

const base = process.argv[2] ?? 'http://localhost:4200';
const browser = await chromium.launch({ channel: 'msedge' });
const results = [];
const check = (name, ok, extra = '') => results.push({ name, ok, extra });
const hidden = (locator) =>
  locator
    .waitFor({ state: 'hidden', timeout: 2000 })
    .then(() => true)
    .catch(() => false);

// Mobile: menu, focus, Escape.
{
  const ctx = await browser.newContext({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(`${base}/ka`, { waitUntil: 'networkidle' });

  check('cookie banner visible on first visit', await page.locator('[role=region][aria-live]').isVisible());
  await page.getByRole('button', { name: 'უარი' }).click();
  check('cookie banner hidden after choice', await hidden(page.locator('[role=region][aria-live]')));

  await page.locator('button[aria-controls="mobile-menu"]').click();
  const dialog = page.getByRole('dialog');
  check('menu opens', await dialog.waitFor({ state: 'visible', timeout: 2000 }).then(() => true, () => false));
  await page.waitForTimeout(700);
  check('focus moves into menu', await page.evaluate(() => !!document.activeElement?.closest('#mobile-menu')));
  check('page scroll locked', await page.evaluate(() => document.documentElement.classList.contains('overflow-hidden')));
  await page.screenshot({ path: 'docs/screenshots/stage1/ka-menu-360.png' });
  await page.keyboard.press('Escape');
  check('Escape closes menu', await hidden(dialog));
  check('focus returns to burger', await page.evaluate(() => document.activeElement?.getAttribute('aria-controls') === 'mobile-menu'));

  await page.locator('button[aria-controls="mobile-menu"]').click();
  await dialog.waitFor({ state: 'visible' });
  await page.waitForTimeout(700);
  await dialog.getByRole('link', { name: /ფასები/ }).click();
  await page.waitForURL('**/ka/prices');
  check('menu link navigates and closes menu', await hidden(dialog), page.url());
  await ctx.close();
}

// Desktop: language switch keeps the page and query.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('noble.consent.v1', 'denied'));
  const page = await ctx.newPage();
  await page.goto(`${base}/ka/services/polishing?utm_source=test`, { waitUntil: 'networkidle' });
  await page.locator('header a[hreflang="ru"]').click();
  await page.waitForURL('**/ru/services/polishing?utm_source=test');
  check('language switch keeps page + query', true, page.url());
  check('html lang updated', (await page.getAttribute('html', 'lang')) === 'ru');
  check('title translated', (await page.title()).startsWith('Полировка'), await page.title());
  check(
    'canonical updated',
    (await page.getAttribute('link[rel=canonical]', 'href')) === 'https://nobledetailing.ge/ru/services/polishing/',
  );
  const h1 = await page.locator('h1').innerText();
  check('h1 translated', h1.includes('Полировка'), h1);

  await page.goto(`${base}/ru/`, { waitUntil: 'domcontentloaded' });
  check('home lead form', (await page.locator('#lead app-lead-form').count()) === 1);

  const res = await page.goto(`${base}/en/services/does-not-exist`);
  check('unknown slug returns 404', res?.status() === 404, String(res?.status()));
  await ctx.close();
}

// Desktop: gallery lightbox and price accordion.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('noble.consent.v1', 'denied'));
  const page = await ctx.newPage();
  await page.goto(`${base}/ru/about`, { waitUntil: 'domcontentloaded' });
  // Wait for hydration: before it, a tile click just opens the image file (no-JS fallback).
  await page.waitForTimeout(1500);
  const tile = page.locator('app-gallery a').first();
  await tile.scrollIntoViewIfNeeded();
  await tile.click();
  const box = page.locator('dialog.lightbox');
  const counter = box.locator('[aria-live]');
  await page.waitForTimeout(400);
  check('lightbox opens on tile click', await box.evaluate((d) => d.open).catch(() => false));
  check('lightbox counter 1 / N', /^1 \/ \d+$/.test((await counter.innerText()).trim()));
  check('focus on close button', await page.evaluate(() => !!document.activeElement?.closest('dialog.lightbox button')));
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  check('ArrowRight shows next photo', (await counter.innerText()).trim().startsWith('2 /'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  check('Escape closes lightbox', !(await box.evaluate((d) => d.open)));
  check('focus returns to tile', await page.evaluate(() => !!document.activeElement?.closest('app-gallery')));
  check('scroll unlocked after lightbox', await page.evaluate(() => !document.documentElement.classList.contains('overflow-hidden')));

  await page.goto(`${base}/ru/prices`, { waitUntil: 'domcontentloaded' });
  const first = page.locator('details').first();
  await first.locator('summary').click();
  check('price row expands', await first.evaluate((d) => d.open));
  await ctx.close();
}

// Works open in a lightbox (no detail pages), reviews carousel, FAQ, journal.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('noble.consent.v1', 'denied'));
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(`${base}/ru/works`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await page.locator('app-work-card a').nth(1).click();
  const box = page.locator('dialog.lightbox');
  await page.waitForTimeout(400);
  check('work card opens lightbox', await box.evaluate((d) => d.open).catch(() => false));
  check('work click stays on /works', page.url().endsWith('/ru/works'), page.url());
  const caption = (await box.locator('p').first().innerText()).trim();
  check('lightbox caption = car · services', caption.startsWith('Lexus NX'), caption);
  check('lightbox starts at the car photos', (await box.locator('[aria-live]').innerText()).trim().startsWith('2 /'));
  await page.waitForTimeout(800);
  const photo = await box.locator('app-media-frame').evaluate((f) => {
    const img = f.querySelector('img');
    return { h: f.getBoundingClientRect().height, loaded: !!img?.complete && img.naturalWidth > 0 };
  });
  check('lightbox photo is visible', photo.h > 200 && photo.loaded, JSON.stringify(photo));
  await page.keyboard.press('Escape');

  const clip = page.locator('app-video-clip video').first();
  await clip.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  check('studio video plays when visible', await clip.evaluate((v) => !v.paused && v.readyState >= 2));
  await page.locator('app-video-clip button').first().click();
  check('video pause button works', await clip.evaluate((v) => v.paused));

  const old = await page.goto(`${base}/ru/works/bmw`);
  check('old work URL redirects to /works', page.url().endsWith('/ru/works'), `${old?.status()} ${page.url()}`);

  await page.goto(`${base}/ru/reviews`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const carousel = page.locator('[aria-roledescription=carousel]');
  const [prev, next] = [carousel.locator('button').nth(0), carousel.locator('button').nth(1)];
  check('carousel prev disabled at start', await prev.isDisabled());
  await next.click();
  await page.waitForTimeout(800);
  check('carousel scrolls on next', (await carousel.locator('ul').evaluate((el) => el.scrollLeft)) > 0);
  check('carousel prev enabled after next', !(await prev.isDisabled()));
  check('Yandex rating shown', (await page.locator('app-rating-summary').innerText()).includes('Яндекс Карты'));

  await page.goto(`${base}/ru/faq`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const faq = page.locator('app-faq-list details');
  check('FAQ has questions', (await faq.count()) >= 10, String(await faq.count()));
  await faq.first().locator('summary').click();
  check('FAQ answer expands', await faq.first().evaluate((d) => d.open));

  await page.goto(`${base}/ru/journal`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.locator('app-article-card a').first().click();
  await page.waitForURL('**/ru/journal/*');
  await page.waitForTimeout(800);
  check('article opens with body', (await page.locator('app-rich-text h2').count()) > 0, page.url());

  await page.goto(`${base}/ru/privacy`, { waitUntil: 'domcontentloaded' });
  check('privacy policy has 17 sections', (await page.locator('app-rich-text h2').count()) === 17);
  await page.goto(`${base}/ru/services/polishing`, { waitUntil: 'domcontentloaded' });
  check('polishing page shows videos', (await page.locator('app-video-clip').count()) === 3);
  check('view transitions supported', await page.evaluate(() => typeof document.startViewTransition === 'function'));
  check('no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.extra ? `  (${r.extra})` : ''}`);
if (results.some((r) => !r.ok)) process.exitCode = 1;
