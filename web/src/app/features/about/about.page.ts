import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { SITE } from '../../core/config/site.config';
import { ContentService } from '../../core/data/content.service';
import { formatMoney, formatRating } from '../../core/i18n/format';
import { LangService } from '../../core/i18n/lang.service';
import type { Service } from '../../core/models';
import { breadcrumbLd, localBusinessLd } from '../../core/seo/json-ld';
import { SeoService } from '../../core/seo/seo.service';
import { ContactCta } from '../../shared/ui/contact-cta/contact-cta';
import { ContactDetails } from '../../shared/ui/contact-details/contact-details';
import { Gallery } from '../../shared/ui/gallery/gallery';
import { Icon } from '../../shared/ui/icon/icon';
import { MediaFrame } from '../../shared/ui/media-frame/media-frame';
import { PageHero } from '../../shared/ui/page-hero/page-hero';
import { Reveal } from '../../shared/ui/reveal.directive';
import { SectionHeading } from '../../shared/ui/section-heading/section-heading';

const STUDIO_FEATURES = [
  { key: 'light', media: 'studio/hall-perspective' },
  { key: 'bays', media: 'studio/glass-bays' },
  { key: 'wash', media: 'studio/wash-bay' },
  { key: 'lounge', media: 'studio/lounge' },
] as const;

const STUDIO_GALLERY = [
  'studio/hall',
  'studio/logo-wall',
  'studio/bay',
  'studio/glass-bays',
  'studio/office',
  'studio/lounge',
  'studio/hall-perspective',
  'studio/wash-bay',
];

@Component({
  selector: 'app-about-page',
  imports: [RouterLink, TranslocoPipe, PageHero, MediaFrame, Gallery, SectionHeading, ContactDetails, ContactCta, Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      [title]="'pages.about.title' | transloco"
      [eyebrow]="'pages.about.eyebrow' | transloco"
      [lead]="'pages.about.lead' | transloco"
      [crumbs]="[{ label: 'nav.about' | transloco }]"
    />

    <section class="container-page grid gap-10 py-section lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16" aria-labelledby="intro-title">
      <app-media-frame id="studio/hall" ratio="4 / 3" sizes="(min-width: 1024px) 55vw, 100vw" class="rounded-card shadow-lift" [priority]="true" />
      <div>
        <p class="eyebrow text-sand-700">{{ 'about.intro.eyebrow' | transloco }}</p>
        <h2 id="intro-title" class="mt-3 text-h2 text-night-950">{{ 'about.intro.title' | transloco }}</h2>
        <p class="mt-5 text-lead text-muted">{{ 'about.intro.text' | transloco }}</p>
        <dl class="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line">
          <div class="bg-white p-5">
            <dt class="text-sm text-subtle">{{ 'about.facts.rating' | transloco }}</dt>
            <dd class="mt-1 font-display text-2xl font-semibold text-night">{{ rating }} ★</dd>
          </div>
          <div class="bg-white p-5">
            <dt class="text-sm text-subtle">{{ 'about.facts.reply' | transloco }}</dt>
            <dd class="mt-1 font-display text-2xl font-semibold text-night">
              {{ 'about.facts.minutes' | transloco: { value: site.responseTimeMinutes } }}
            </dd>
          </div>
          <div class="bg-white p-5">
            <dt class="text-sm text-subtle">{{ 'about.facts.film' | transloco }}</dt>
            <dd class="mt-1 font-display text-2xl font-semibold text-night">
              {{ 'about.facts.filmValue' | transloco: { min: site.warranty.filmYears.min, max: site.warranty.filmYears.max } }}
            </dd>
          </div>
          <div class="bg-white p-5">
            <dt class="text-sm text-subtle">{{ 'about.facts.work' | transloco }}</dt>
            <dd class="mt-1 font-display text-2xl font-semibold text-night">
              {{ 'about.facts.workValue' | transloco: { value: site.warranty.ppfWorkYears } }}
            </dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="on-dark bg-night-950 py-section text-white" aria-labelledby="studio-title">
      <div class="container-page">
        <app-section-heading
          headingId="studio-title"
          [dark]="true"
          [eyebrow]="'about.studio.eyebrow' | transloco"
          [title]="'about.studio.title' | transloco"
          [lead]="'about.studio.lead' | transloco"
        />
        <ul class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          @for (f of features; track f.key; let i = $index) {
            <li class="overflow-hidden rounded-card bg-night-900" [appReveal]="i * 80">
              <app-media-frame [id]="f.media" ratio="4 / 5" sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw" />
              <div class="p-6">
                <h3 class="text-h4 text-white">{{ 'about.studio.' + f.key + '.title' | transloco }}</h3>
                <p class="mt-2 text-[0.9375rem] text-white/65">{{ 'about.studio.' + f.key + '.text' | transloco }}</p>
              </div>
            </li>
          }
        </ul>
      </div>
    </section>

    <section class="py-section" aria-labelledby="services-title">
      <div class="container-page">
        <app-section-heading
          headingId="services-title"
          [eyebrow]="'about.services.eyebrow' | transloco"
          [title]="'about.services.title' | transloco"
          [lead]="'about.services.lead' | transloco"
        >
          <a [routerLink]="langs.link('/services')" class="inline-flex shrink-0 items-center gap-2 text-night hover:underline">
            {{ 'common.allServices' | transloco }} <app-icon name="arrow-right" [size]="16" />
          </a>
        </app-section-heading>
        <div class="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          @for (g of groups; track g.category; let i = $index) {
            <div [appReveal]="(i % 3) * 80">
              <h3 class="flex items-baseline gap-3 border-b border-line pb-3 text-h4 text-night-950">
                <span class="font-display text-sm tracking-[0.2em] text-sand-700">0{{ i + 1 }}</span>
                {{ 'categories.' + g.category | transloco }}
              </h3>
              <ul class="mt-2">
                @for (s of g.services; track s.slug) {
                  <li>
                    <a
                      [routerLink]="langs.link('/services/' + s.slug)"
                      class="group flex items-baseline justify-between gap-4 py-2.5 text-[0.9375rem] transition-colors hover:text-night"
                    >
                      <span class="group-hover:underline">{{ langs.pick(s.name) }}</span>
                      <span class="shrink-0 text-sm whitespace-nowrap text-subtle">{{ 'common.priceFrom' | transloco: { value: money(s) } }}</span>
                    </a>
                  </li>
                }
              </ul>
            </div>
          }
        </div>
        <p class="mt-10 text-sm text-subtle">{{ 'common.exactPrice' | transloco }}</p>
      </div>
    </section>

    <section class="bg-mist py-section" aria-labelledby="gallery-title">
      <div class="container-page">
        <app-section-heading headingId="gallery-title" [eyebrow]="'about.gallery.eyebrow' | transloco" [title]="'about.gallery.title' | transloco" />
        <app-gallery class="mt-10" [items]="gallery" layout="mosaic" ratio="1 / 1" />
      </div>
    </section>

    <section id="map" class="py-section" aria-labelledby="map-title">
      <div class="container-page">
        <app-section-heading headingId="map-title" [eyebrow]="'about.map.eyebrow' | transloco" [title]="'about.map.title' | transloco" />
        <app-contact-details class="mt-10" placement="about_map" />
      </div>
    </section>

    <app-contact-cta placement="about_cta" />
  `,
})
export class AboutPage {
  protected readonly langs = inject(LangService);
  protected readonly site = inject(SITE);
  private readonly seo = inject(SeoService);
  protected readonly groups = inject(ContentService).categories();
  protected readonly features = STUDIO_FEATURES;
  protected readonly gallery = STUDIO_GALLERY;

  protected get rating(): string {
    return formatRating(this.site.rating.google.value, this.langs.lang());
  }

  protected money(s: Service): string {
    return formatMoney(s.price.from, s.price.currency, this.langs.lang());
  }

  constructor() {
    effect(() => {
      const lang = this.langs.lang();
      this.seo.set({
        title: this.langs.t('seo.about.title'),
        description: this.langs.t('seo.about.description'),
        path: '/about',
        image: '/media/studio/hall-1200.webp',
        jsonLd: [
          localBusinessLd(this.site, lang),
          breadcrumbLd([
            { name: this.langs.t('breadcrumbs.home'), url: this.seo.url('/') },
            { name: this.langs.t('nav.about'), url: this.seo.url('/about') },
          ]),
        ],
      });
    });
  }
}
