import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, REQUEST, inject } from '@angular/core';
import { CanMatchFn, RedirectFunction, ResolveFn } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { map } from 'rxjs';
import { DEFAULT_LANG, isLang, pickLang, type Lang } from './lang';
import { LangService } from './lang.service';

/** Only `/ka`, `/ru`, `/en` match the localized branch. */
export const langMatch: CanMatchFn = (_route, segments) => isLang(segments[0]?.path);

/** Loads translations before the page renders (also on the server), then activates the language. */
export const langResolver: ResolveFn<Lang> = (route) => {
  const lang = route.paramMap.get('lang') as Lang;
  const transloco = inject(TranslocoService);
  const langService = inject(LangService);
  return transloco.load(lang).pipe(
    map(() => {
      langService.use(lang);
      return lang;
    }),
  );
};

/** `/` → preferred language (Accept-Language on the server, navigator.languages in the browser). */
export const rootRedirect: RedirectFunction = () => {
  if (isPlatformBrowser(inject(PLATFORM_ID))) {
    return `/${pickLang(navigator.languages)}`;
  }
  const request = inject(REQUEST, { optional: true });
  return `/${request ? pickLang(request.headers.get('accept-language')) : DEFAULT_LANG}`;
};

/** Unprefixed deep links (`/services/ppf-full`) → `/{lang}/services/ppf-full`. */
export const unprefixedRedirect: RedirectFunction = ({ url }) => {
  const path = url.map((s) => s.path).join('/');
  return `/${DEFAULT_LANG}/${path}`;
};
