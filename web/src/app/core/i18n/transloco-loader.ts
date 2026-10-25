import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { from, Observable } from 'rxjs';
import type { Lang } from './lang';

/**
 * Translations are bundled as lazy chunks instead of fetched over HTTP, so the
 * same loader works during prerender/SSR (no absolute URL needed) and in the browser.
 */
const LOADERS: Record<Lang, () => Promise<Translation>> = {
  ka: () => import('../../../assets/i18n/ka.json').then((m) => m.default),
  ru: () => import('../../../assets/i18n/ru.json').then((m) => m.default),
  en: () => import('../../../assets/i18n/en.json').then((m) => m.default),
};

@Injectable({ providedIn: 'root' })
export class BundledTranslocoLoader implements TranslocoLoader {
  getTranslation(lang: string): Observable<Translation> {
    const load = LOADERS[lang as Lang] ?? LOADERS.ka;
    return from(load());
  }
}
