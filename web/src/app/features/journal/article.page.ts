import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, type ResolveFn } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { map } from 'rxjs';
import { SITE } from '../../core/config/site.config';
import { ContentService } from '../../core/data/content.service';
import { formatDate } from '../../core/i18n/format';
import { LangService } from '../../core/i18n/lang.service';
import { mediaLarge } from '../../core/media/media';
import type { RichText as RichTextData, Service } from '../../core/models';
import { articleLd, breadcrumbLd } from '../../core/seo/json-ld';
import { SeoService } from '../../core/seo/seo.service';
import { ArticleCard } from '../../shared/ui/article-card/article-card';
import { ContactButtons } from '../../shared/ui/contact-buttons/contact-buttons';
import { ContactCta } from '../../shared/ui/contact-cta/contact-cta';
import { Icon } from '../../shared/ui/icon/icon';
import { MediaFrame } from '../../shared/ui/media-frame/media-frame';
import { PageHero } from '../../shared/ui/page-hero/page-hero';
import { RichText } from '../../shared/ui/rich-text/rich-text';
import { SectionHeading } from '../../shared/ui/section-heading/section-heading';
import { NotFoundPage } from '../not-found/not-found.page';

/** Loads the article body chunk before the page renders, so prerendered HTML contains the full text. */
export const articleBodyResolver: ResolveFn<RichTextData | null> = (route) =>
  inject(ContentService).articleBody(route.paramMap.get('slug') ?? '');

@Component({
  selector: 'app-article-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    PageHero,
    MediaFrame,
    RichText,
    Icon,
    ContactButtons,
    ContactCta,
    SectionHeading,
    ArticleCard,
    NotFoundPage,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (article(); as a) {
      <app-page-hero
        [title]="langs.pick(a.title)"
        [eyebrow]="'pages.journal.eyebrow' | transloco"
        [lead]="langs.pick(a.excerpt)"
        [crumbs]="[{ label: 'nav.journal' | transloco, path: '/journal' }, { label: langs.pick(a.title) }]"
      >
        <p class="mt-8 text-sm text-white/75">
          <time [attr.datetime]="a.date">{{ date() }}</time>
          <span aria-hidden="true"> · </span>{{ 'journal.readMinutes' | transloco: { n: a.readMinutes } }}
        </p>
      </app-page-hero>

      <article class="container-page grid gap-12 py-section lg:grid-cols-[1fr_20rem] lg:gap-16">
        <div class="min-w-0">
          <app-media-frame [id]="a.cover" ratio="16 / 9" sizes="(min-width: 1024px) 60vw, 100vw" class="rounded-card" />
          @if (blocks().length) {
            <app-rich-text class="mt-12" [blocks]="blocks()" [attr.lang]="textLang()" />
          }
          @if (textLang() !== langs.lang()) {
            <p class="mt-8 text-sm text-subtle">{{ 'journal.fallbackLang' | transloco }}</p>
          }
        </div>

        <aside class="space-y-6 lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:self-start">
          @if (services().length) {
            <div class="rounded-card border border-line p-6">
              <h2 class="text-h4 text-night-950">{{ 'journal.relatedServices' | transloco }}</h2>
              <ul class="mt-4 divide-y divide-line">
                @for (s of services(); track s.slug) {
                  <li>
                    <a [routerLink]="langs.link('/services/' + s.slug)" class="group flex items-center justify-between gap-3 py-3 text-night">
                      <span class="group-hover:underline">{{ langs.pick(s.name) }}</span>
                      <app-icon name="arrow-right" [size]="16" class="shrink-0 transition-transform group-hover:translate-x-1" />
                    </a>
                  </li>
                }
              </ul>
            </div>
          }
          <div class="rounded-card bg-mist p-6">
            <h2 class="text-h4 text-night-950">{{ 'journal.askTitle' | transloco }}</h2>
            <p class="mt-2 text-sm text-muted">{{ 'journal.askText' | transloco }}</p>
            <app-contact-buttons class="mt-5 [&>a]:w-full [&>a]:justify-center" placement="article_aside" [dark]="false" [instagram]="false" />
          </div>
        </aside>
      </article>

      @if (others().length) {
        <section class="border-t border-line py-section" aria-labelledby="more-articles-title">
          <div class="container-page">
            <app-section-heading headingId="more-articles-title" [title]="'journal.more' | transloco">
              <a [routerLink]="langs.link('/journal')" class="inline-flex shrink-0 items-center gap-2 text-night hover:underline">
                {{ 'common.viewAll' | transloco }} <app-icon name="arrow-right" [size]="16" />
              </a>
            </app-section-heading>
            <ul class="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-3">
              @for (o of others(); track o.slug) {
                <li><app-article-card [article]="o" /></li>
              }
            </ul>
          </div>
        </section>
      }

      <app-contact-cta placement="article_cta" />
    } @else {
      <app-not-found-page />
    }
  `,
})
export class ArticlePage {
  protected readonly langs = inject(LangService);
  private readonly site = inject(SITE);
  private readonly content = inject(ContentService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);

  private readonly slug = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug'))), { requireSync: true });
  private readonly body = toSignal(this.route.data.pipe(map((d) => d['body'] as RichTextData | null)), { requireSync: true });

  protected readonly article = computed(() => {
    const a = this.content.article(this.slug());
    return a && this.body() ? a : undefined;
  });
  /** Russian is the source text; other languages fall back to it if a translation is missing. */
  protected readonly textLang = computed(() => (this.body()?.[this.langs.lang()]?.length ? this.langs.lang() : 'ru'));
  protected readonly blocks = computed(() => this.body()?.[this.textLang()] ?? []);
  protected readonly date = computed(() => {
    const a = this.article();
    return a ? formatDate(a.date, this.langs.lang()) : '';
  });
  protected readonly services = computed(() =>
    (this.article()?.serviceSlugs ?? []).map((s) => this.content.service(s)).filter((s): s is Service => !!s),
  );
  protected readonly others = computed(() => this.content.articles.filter((a) => a.slug !== this.slug()).slice(0, 3));

  constructor() {
    effect(() => {
      const a = this.article();
      const lang = this.langs.lang();
      if (!a) return;
      const path = `/journal/${a.slug}`;
      const title = a.title[lang];
      this.seo.set({
        title: `${title} — Noble Detailing`,
        description: a.excerpt[lang],
        path,
        type: 'article',
        image: this.site.siteUrl + mediaLarge(a.cover),
        jsonLd: [
          articleLd(this.site, a, lang, this.seo.url(path), this.site.siteUrl + mediaLarge(a.cover)),
          breadcrumbLd([
            { name: this.langs.t('breadcrumbs.home'), url: this.seo.url('/') },
            { name: this.langs.t('nav.journal'), url: this.seo.url('/journal') },
            { name: title, url: this.seo.url(path) },
          ]),
        ],
      });
    });
  }
}
