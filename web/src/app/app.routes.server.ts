import { RenderMode, ServerRoute } from '@angular/ssr';
import { CONTENT_SLUGS } from './core/data/content.service';
import { LANGS } from './core/i18n/lang';
import { STATIC_PAGES } from './app.routes';

const perLang = async () => LANGS.map((lang) => ({ lang }));
const perLangAnd = (key: string, values: readonly string[]) => async () =>
  LANGS.flatMap((lang) => values.map((value) => ({ lang, [key]: value })));

/** Every language × every page × every slug from the data files is prerendered to static HTML. */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  ...STATIC_PAGES.map(
    (page): ServerRoute => ({
      path: page ? `:lang/${page}` : ':lang',
      renderMode: RenderMode.Prerender,
      getPrerenderParams: perLang,
    }),
  ),
  { path: ':lang/services/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: perLangAnd('slug', CONTENT_SLUGS.services) },
  { path: ':lang/journal/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: perLangAnd('slug', CONTENT_SLUGS.journal) },
  { path: '**', renderMode: RenderMode.Server },
];
