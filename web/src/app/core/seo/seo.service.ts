import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE } from '../config/site.config';
import { DEFAULT_LANG, LANG_LOCALE, LANGS, type Lang } from '../i18n/lang';
import { LangService } from '../i18n/lang.service';

export interface SeoData {
  title: string;
  description: string;
  /** Path without language prefix: '/', '/services/ppf-full'. */
  path: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: Record<string, unknown>[];
}

const MANAGED = 'data-seo';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly doc = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly site = inject(SITE);
  private readonly langs = inject(LangService);

  /** Absolute URL with a trailing slash: prerendered pages are folders, and static hosts redirect to `/path/`. */
  url(path: string, lang: Lang = this.langs.lang()): string {
    return `${this.site.siteUrl}${this.langs.link(path, lang)}/`;
  }

  set(data: SeoData): void {
    const lang = this.langs.lang();
    const canonical = this.url(data.path, lang);
    const image = new URL(data.image ?? '/brand/og-default.jpg', this.site.siteUrl).toString();

    this.title.setTitle(data.title);
    this.tag('name', 'description', data.description);
    this.tag('name', 'robots', data.noindex ? 'noindex, follow' : 'index, follow');

    this.tag('property', 'og:type', data.type ?? 'website');
    this.tag('property', 'og:site_name', this.site.name);
    this.tag('property', 'og:title', data.title);
    this.tag('property', 'og:description', data.description);
    this.tag('property', 'og:url', canonical);
    this.tag('property', 'og:image', image);
    this.tag('property', 'og:locale', LANG_LOCALE[lang]);
    this.tag('name', 'twitter:card', 'summary_large_image');
    this.tag('name', 'twitter:title', data.title);
    this.tag('name', 'twitter:description', data.description);
    this.tag('name', 'twitter:image', image);

    this.clearManaged();
    this.link('canonical', canonical);
    for (const l of LANGS) this.link('alternate', this.url(data.path, l), l);
    this.link('alternate', this.url(data.path, DEFAULT_LANG), 'x-default');

    for (const ld of data.jsonLd ?? []) this.jsonLd(ld);
  }

  private tag(attr: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attr]: key, content }, `${attr}="${key}"`);
  }

  private clearManaged(): void {
    this.doc.head.querySelectorAll(`[${MANAGED}]`).forEach((el) => el.remove());
  }

  private link(rel: string, href: string, hreflang?: string): void {
    const el = this.doc.createElement('link');
    el.setAttribute('rel', rel);
    el.setAttribute('href', href);
    if (hreflang) el.setAttribute('hreflang', hreflang);
    el.setAttribute(MANAGED, '');
    this.doc.head.appendChild(el);
  }

  private jsonLd(data: Record<string, unknown>): void {
    const el = this.doc.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute(MANAGED, '');
    el.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
    this.doc.head.appendChild(el);
  }
}
