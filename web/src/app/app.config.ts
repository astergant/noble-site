import { IMAGE_CONFIG, IMAGE_LOADER } from '@angular/common';
import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {
  type ViewTransitionInfo,
  provideRouter,
  withInMemoryScrolling,
  withRouterConfig,
  withViewTransitions,
} from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { routes } from './app.routes';
import { DEFAULT_LANG, LANGS } from './core/i18n/lang';
import { BundledTranslocoLoader } from './core/i18n/transloco-loader';
import { mediaLoader } from './core/media/media';

/** The crown curtain (styles.css) plays only when the page path changes and motion is allowed. */
function curtainOnlyBetweenPages({ transition, from, to }: ViewTransitionInfo): void {
  const path = (s: typeof from) => {
    let leaf = s;
    while (leaf.firstChild) leaf = leaf.firstChild;
    return leaf.pathFromRoot.flatMap((r) => r.url.map((u) => u.path)).join('/');
  };
  const reduce = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduce || path(from) === path(to)) transition.skipTransition();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
      withViewTransitions({ skipInitialTransition: true, onViewTransitionCreated: curtainOnlyBetweenPages }),
    ),
    provideClientHydration(withEventReplay()),
    { provide: IMAGE_LOADER, useValue: mediaLoader },
    // Must match WIDTHS in tools/optimize-media.py.
    { provide: IMAGE_CONFIG, useValue: { breakpoints: [480, 800, 1200, 1600, 2000] } },
    provideTransloco({
      config: {
        availableLangs: [...LANGS],
        defaultLang: DEFAULT_LANG,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: { logMissingKey: isDevMode() },
      },
      loader: BundledTranslocoLoader,
    }),
  ],
};
