import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { type ResolveFn, Routes } from '@angular/router';
import site from './data/site.json';
import { langMatch, langResolver, rootRedirect, unprefixedRedirect } from './core/i18n/lang.routing';
import { Shell } from './layout/shell/shell';

const placeholder = () => import('./features/placeholder/placeholder.page').then((m) => m.PlaceholderPage);
const legal = () => import('./features/legal/legal.page').then((m) => m.LegalPage);

/** Lazy wrapper so the article page chunk isn't pulled into the main bundle by the resolver import. */
const articleBodyResolver: ResolveFn<unknown> = (route, state) => {
  const injector = inject(EnvironmentInjector);
  return import('./features/journal/article.page').then((m) =>
    runInInjectionContext(injector, () => m.articleBodyResolver(route, state)),
  );
};

/**
 * Static child paths (without language). Also used by app.routes.server.ts for prerender,
 * so every page here is generated for ka, ru and en.
 */
export const STATIC_PAGES = [
  '',
  'services',
  'prices',
  'works',
  'about',
  'reviews',
  'faq',
  'journal',
  'contacts',
  'book',
  'privacy',
  'terms',
  '404',
] as const;

const page = (path: (typeof STATIC_PAGES)[number]) => ({
  path,
  loadComponent: placeholder,
  data: { page: path, path: `/${path}` },
});

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: rootRedirect },
  {
    path: ':lang',
    canMatch: [langMatch],
    component: Shell,
    resolve: { lang: langResolver },
    children: [
      { path: '', loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage) },
      { path: 'services', loadComponent: () => import('./features/services/services.page').then((m) => m.ServicesPage) },
      {
        path: 'services/:slug',
        loadComponent: () => import('./features/service-detail/service-detail.page').then((m) => m.ServiceDetailPage),
      },
      { path: 'prices', loadComponent: () => import('./features/prices/prices.page').then((m) => m.PricesPage) },
      { path: 'works', loadComponent: () => import('./features/works/works.page').then((m) => m.WorksPage) },
      { path: 'works/:id', redirectTo: ({ params }) => `/${params['lang']}/works` },
      { path: 'about', loadComponent: () => import('./features/about/about.page').then((m) => m.AboutPage) },
      { path: 'reviews', loadComponent: () => import('./features/reviews/reviews.page').then((m) => m.ReviewsPage) },
      { path: 'faq', loadComponent: () => import('./features/faq/faq.page').then((m) => m.FaqPage) },
      { path: 'journal', loadComponent: () => import('./features/journal/journal.page').then((m) => m.JournalPage) },
      {
        path: 'journal/:slug',
        loadComponent: () => import('./features/journal/article.page').then((m) => m.ArticlePage),
        resolve: { body: articleBodyResolver },
      },
      { path: 'contacts', loadComponent: () => import('./features/contacts/contacts.page').then((m) => m.ContactsPage) },
      site.features.leadForm ? page('book') : { path: 'book', redirectTo: 'contacts' },
      { path: 'privacy', loadComponent: legal, data: { legal: 'privacy' } },
      { path: 'terms', loadComponent: legal, data: { legal: 'terms' } },
      { path: '404', loadComponent: () => import('./features/not-found/not-found.page').then((m) => m.NotFoundPage) },
      { path: '**', loadComponent: () => import('./features/not-found/not-found.page').then((m) => m.NotFoundPage) },
    ],
  },
  { path: '**', redirectTo: unprefixedRedirect },
];
