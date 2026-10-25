import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { map } from 'rxjs';
import { ContactService } from '../../core/config/contact.service';
import { ContentService } from '../../core/data/content.service';
import { formatMoney } from '../../core/i18n/format';
import { LangService } from '../../core/i18n/lang.service';
import type { Service } from '../../core/models';
import { breadcrumbLd, serviceLd } from '../../core/seo/json-ld';
import { SeoService } from '../../core/seo/seo.service';
import { ContactButtons } from '../../shared/ui/contact-buttons/contact-buttons';
import { ContactCta } from '../../shared/ui/contact-cta/contact-cta';
import { Icon } from '../../shared/ui/icon/icon';
import { MediaFrame } from '../../shared/ui/media-frame/media-frame';
import { PageHero } from '../../shared/ui/page-hero/page-hero';
import { PriceTable } from '../../shared/ui/price-table/price-table';
import { Reveal } from '../../shared/ui/reveal.directive';
import { SectionHeading } from '../../shared/ui/section-heading/section-heading';
import { ServiceCard } from '../../shared/ui/service-card/service-card';
import { ArticleCard } from '../../shared/ui/article-card/article-card';
import { FaqList } from '../../shared/ui/faq-list/faq-list';
import { VideoClip } from '../../shared/ui/video-clip/video-clip';
import { WorksGrid } from '../../shared/ui/works-grid/works-grid';
import { NotFoundPage } from '../not-found/not-found.page';

@Component({
  selector: 'app-service-detail-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    PageHero,
    Icon,
    NotFoundPage,
    ContactButtons,
    ContactCta,
    MediaFrame,
    PriceTable,
    SectionHeading,
    ServiceCard,
    WorksGrid,
    FaqList,
    ArticleCard,
    VideoClip,
    Reveal,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (service(); as s) {
      <app-page-hero
        [title]="langs.pick(s.name)"
        [eyebrow]="'categories.' + s.category | transloco"
        [lead]="langs.pick(s.short)"
        [crumbs]="[{ label: 'nav.services' | transloco, path: '/services' }, { label: langs.pick(s.name) }]"
      >
        <dl class="mt-10 flex flex-wrap gap-x-12 gap-y-4">
          <div>
            <dt class="text-xs tracking-[0.2em] text-white/75 uppercase">{{ 'common.price' | transloco }}</dt>
            <dd class="mt-1 font-display text-2xl text-sand">{{ 'common.priceFrom' | transloco: { value: price() } }}</dd>
          </div>
          <div>
            <dt class="text-xs tracking-[0.2em] text-white/75 uppercase">{{ 'common.duration' | transloco }}</dt>
            <dd class="mt-1 font-display text-2xl">{{ langs.pick(s.duration) }}</dd>
          </div>
        </dl>
        <p class="mt-4 text-sm text-white/75">{{ 'common.exactPrice' | transloco }}</p>
        <app-contact-buttons class="mt-8" placement="service_hero" [instagram]="false" />
      </app-page-hero>

      <div class="container-page grid gap-12 py-section lg:grid-cols-[1fr_24rem] lg:gap-16">
        <div class="min-w-0">
          @if (s.image) {
            <app-media-frame [id]="s.image" ratio="16 / 10" sizes="(min-width: 1024px) 60vw, 100vw" class="rounded-card" />
          }

          <section [class.mt-12]="!!s.image" aria-labelledby="about-title">
            <h2 id="about-title" class="text-h3 text-night-950">{{ 'service.about' | transloco }}</h2>
            <p class="mt-4 max-w-2xl text-lead text-muted">{{ langs.pick(s.description) }}</p>
          </section>

          <section class="mt-12" aria-labelledby="includes-title">
            <h2 id="includes-title" class="text-h3 text-night-950">{{ 'common.includes' | transloco }}</h2>
            <ul class="mt-6 grid gap-3 sm:grid-cols-2">
              @for (item of s.includes; track $index) {
                <li class="flex gap-3 rounded-control bg-mist px-4 py-3.5 text-[0.9375rem]">
                  <app-icon name="check" [size]="18" class="mt-0.5 shrink-0 text-sand-700" />
                  <span>{{ langs.pick(item) }}</span>
                </li>
              }
            </ul>
          </section>

          @if (s.category === 'protection' && ppfOptions().length > 1) {
            <section class="mt-12" aria-labelledby="ppf-title">
              <h2 id="ppf-title" class="text-h3 text-night-950">{{ 'service.ppfCompareTitle' | transloco }}</h2>
              <p class="mt-3 max-w-2xl text-muted">{{ 'service.ppfCompareLead' | transloco }}</p>
              <div class="mt-6 grid gap-4 md:grid-cols-2">
                @for (o of ppfOptions(); track o.slug) {
                  <a
                    [routerLink]="langs.link('/services/' + o.slug)"
                    class="flex flex-col rounded-card border p-6 transition-colors"
                    [class]="o.slug === s.slug ? 'border-sand bg-sand-100/60' : 'border-line hover:border-night/40'"
                    [attr.aria-current]="o.slug === s.slug ? 'page' : null"
                  >
                    <h3 class="text-h4 text-night-950">{{ langs.pick(o.name) }}</h3>
                    <ul class="mt-4 flex-1 space-y-1.5 text-sm text-muted">
                      @for (item of o.includes; track $index) {
                        <li class="flex gap-2"><span class="text-sand-700" aria-hidden="true">—</span>{{ langs.pick(item) }}</li>
                      }
                    </ul>
                    <p class="mt-5 flex items-baseline justify-between gap-3 border-t border-line pt-4">
                      <span class="font-display text-lg font-semibold text-night">{{ 'common.priceFrom' | transloco: { value: money(o) } }}</span>
                      <span class="text-sm text-subtle">{{ langs.pick(o.duration) }}</span>
                    </p>
                  </a>
                }
              </div>
            </section>
          }
        </div>

        <aside class="lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:self-start">
          <div class="rounded-card border border-line bg-white p-6 shadow-soft md:p-8">
            <h2 class="text-h4 text-night-950">{{ 'common.price' | transloco }}</h2>
            <app-price-table [price]="s.price" class="mt-4" />
            <dl class="mt-6 space-y-4 border-t border-line pt-6 text-[0.9375rem]">
              <div class="relative pl-8">
                <dt class="text-subtle">
                  <app-icon name="clock" [size]="18" class="absolute top-0.5 left-0 text-sand-700" />{{ 'common.duration' | transloco }}
                </dt>
                <dd class="text-ink">{{ langs.pick(s.duration) }}</dd>
              </div>
              @if (s.warranty) {
                <div class="relative pl-8">
                  <dt class="text-subtle">
                    <app-icon name="shield-check" [size]="18" class="absolute top-0.5 left-0 text-sand-700" />{{ 'common.warranty' | transloco }}
                  </dt>
                  <dd class="text-ink">{{ langs.pick(s.warranty) }}</dd>
                </div>
              }
            </dl>
            <p class="mt-6 rounded-control bg-mist px-4 py-3 text-sm text-muted">{{ 'common.exactPrice' | transloco }}</p>
            <app-contact-buttons class="mt-6 [&>a]:w-full [&>a]:justify-center" placement="service_aside" [dark]="false" [instagram]="false" />
          </div>
        </aside>
      </div>

      @if (videos().length) {
        <section class="border-t border-line py-section" aria-labelledby="videos-title">
          <div class="container-page">
            <app-section-heading headingId="videos-title" [title]="'service.videos' | transloco" [lead]="'service.videosLead' | transloco" />
            <ul class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              @for (v of videos(); track v.id) {
                <li><app-video-clip [video]="v" /></li>
              }
            </ul>
          </div>
        </section>
      }

      @if (works().length) {
        <section class="bg-mist py-section" aria-labelledby="works-title">
          <div class="container-page">
            <app-section-heading headingId="works-title" [title]="'service.works' | transloco">
              <a [routerLink]="langs.link('/works')" class="inline-flex items-center gap-2 text-night hover:underline">
                {{ 'common.viewAll' | transloco }} <app-icon name="arrow-right" [size]="16" />
              </a>
            </app-section-heading>
            <app-works-grid class="mt-10" [works]="works()" gridClass="md:grid-cols-4" sizes="(min-width: 768px) 25vw, 50vw" />
          </div>
        </section>
      }

      @if (faq().length) {
        <section class="py-section" aria-labelledby="faq-title">
          <div class="container-page grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <app-section-heading headingId="faq-title" [title]="'service.faq' | transloco">
              <a [routerLink]="langs.link('/faq')" class="inline-flex items-center gap-2 text-night hover:underline">
                {{ 'service.allFaq' | transloco }} <app-icon name="arrow-right" [size]="16" />
              </a>
            </app-section-heading>
            <app-faq-list [items]="faq()" name="service-faq" />
          </div>
        </section>
      }

      @if (articles().length) {
        <section class="border-t border-line py-section" aria-labelledby="articles-title">
          <div class="container-page">
            <app-section-heading headingId="articles-title" [title]="'service.articles' | transloco" />
            <ul class="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-3">
              @for (a of articles(); track a.slug) {
                <li><app-article-card [article]="a" /></li>
              }
            </ul>
          </div>
        </section>
      }

      @if (related().length) {
        <section class="py-section" aria-labelledby="related-title">
          <div class="container-page">
            <app-section-heading headingId="related-title" [title]="'service.related' | transloco" />
            <ul class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              @for (r of related(); track r.slug; let i = $index) {
                <li [appReveal]="i * 80"><app-service-card [service]="r" /></li>
              }
            </ul>
          </div>
        </section>
      }

      <app-contact-cta placement="service_cta" />
    } @else {
      <app-not-found-page />
    }
  `,
})
export class ServiceDetailPage {
  protected readonly langs = inject(LangService);
  protected readonly contact = inject(ContactService);
  private readonly content = inject(ContentService);
  private readonly seo = inject(SeoService);

  private readonly slug = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('slug'))), { requireSync: true });
  protected readonly service = computed(() => this.content.service(this.slug()));
  protected readonly price = computed(() => {
    const s = this.service();
    return s ? this.money(s) : '';
  });
  protected readonly ppfOptions = computed(() => ['ppf-risk-zones', 'ppf-full'].map((x) => this.content.service(x)).filter((x): x is Service => !!x));
  protected readonly works = computed(() => {
    const s = this.service();
    return s ? this.content.worksForService(s.slug).slice(0, 4) : [];
  });
  protected readonly videos = computed(() => {
    const s = this.service();
    return s ? this.content.videosForService(s.slug) : [];
  });
  protected readonly related = computed(() => {
    const s = this.service();
    return s ? this.content.related(s) : [];
  });
  protected readonly faq = computed(() => {
    const s = this.service();
    return s ? this.content.faqForService(s.slug) : [];
  });
  protected readonly articles = computed(() => {
    const s = this.service();
    return s ? this.content.articlesForService(s.slug).slice(0, 3) : [];
  });

  protected money(s: Service): string {
    return formatMoney(s.price.from, s.price.currency, this.langs.lang());
  }

  constructor() {
    effect(() => {
      const s = this.service();
      const lang = this.langs.lang();
      if (!s) return;
      const path = `/services/${s.slug}`;
      const name = s.name[lang];
      this.seo.set({
        title: `${name} — Noble Detailing`,
        description: `${s.short[lang].replace(/\.$/, '')} — ${this.langs.t('common.priceFrom', { value: this.price() })}.`,
        path,
        jsonLd: [
          serviceLd(this.contact.site, s, lang, this.seo.url(path)),
          breadcrumbLd([
            { name: this.langs.t('breadcrumbs.home'), url: this.seo.url('/') },
            { name: this.langs.t('nav.services'), url: this.seo.url('/services') },
            { name, url: this.seo.url(path) },
          ]),
        ],
      });
    });
  }
}
