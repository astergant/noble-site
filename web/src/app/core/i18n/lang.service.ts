import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import type { L10n } from '../models';
import { DEFAULT_LANG, type Lang } from './lang';

@Injectable({ providedIn: 'root' })
export class LangService {
  private readonly doc = inject(DOCUMENT);
  private readonly transloco = inject(TranslocoService);

  readonly lang = signal<Lang>(DEFAULT_LANG);

  use(lang: Lang): void {
    this.lang.set(lang);
    this.transloco.setActiveLang(lang);
    this.doc.documentElement.lang = lang;
  }

  /** Absolute in-app path with language prefix, e.g. link('/services') → '/ka/services'. */
  link(path: string, lang: Lang = this.lang()): string {
    const clean = path === '/' || path === '' ? '' : path.startsWith('/') ? path : `/${path}`;
    return `/${lang}${clean}`;
  }

  /** Picks the current-language string from a localized data field. */
  pick(value: L10n | string | undefined | null, lang: Lang = this.lang()): string {
    if (value == null) return '';
    return typeof value === 'string' ? value : (value[lang] ?? value[DEFAULT_LANG] ?? '');
  }

  t(key: string, params?: Record<string, unknown>): string {
    return this.transloco.translate(key, params, this.lang());
  }
}
