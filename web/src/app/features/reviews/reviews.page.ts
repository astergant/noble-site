import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LangService } from '../../core/i18n/lang.service';
import { ReviewsService } from '../../core/reviews/reviews';
import { breadcrumbLd } from '../../core/seo/json-ld';
import { SeoService } from '../../core/seo/seo.service';
import { ContactCta } from '../../shared/ui/contact-cta/contact-cta';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHero } from '../../shared/ui/page-hero/page-hero';
import { RatingSummary } from '../../shared/ui/rating-summary/rating-summary';
import { ReviewsCarousel } from '../../shared/ui/reviews-carousel/reviews-carousel';

@Component({
  selector: 'app-reviews-page',
  imports: [TranslocoPipe, PageHero, RatingSummary, ReviewsCarousel, ContactCta, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      [title]="'pages.reviews.title' | transloco"
      [eyebrow]="'pages.reviews.eyebrow' | transloco"
      [lead]="'pages.reviews.lead' | transloco"
      [crumbs]="[{ label: 'nav.reviews' | transloco }]"
    >
      <app-rating-summary class="mt-10 block" [dark]="true" />
    </app-page-hero>

    <section class="overflow-hidden py-section" aria-labelledby="reviews-list-title">
      <div class="container-page">
        <h2 id="reviews-list-title" class="text-h3 text-night-950">{{ 'reviews.listTitle' | transloco }}</h2>
        <app-reviews-carousel class="mt-8" [reviews]="reviews.all" [clamp]="false" [label]="'reviews.listTitle' | transloco" />
        <p class="mt-6 max-w-2xl text-sm text-subtle">{{ 'reviews.disclaimer' | transloco }}</p>
      </div>
    </section>

    <section class="bg-mist py-section" aria-labelledby="reviews-leave-title">
      <div class="container-page grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 id="reviews-leave-title" class="text-h3 text-night-950">{{ 'reviews.leaveTitle' | transloco }}</h2>
          <p class="mt-3 max-w-xl text-muted">{{ 'reviews.leaveText' | transloco }}</p>
        </div>
        <ul class="flex flex-wrap gap-3 lg:justify-end">
          @for (s of reviews.summaries; track s.source) {
            <li>
              <a
                [href]="s.url"
                target="_blank"
                rel="noopener"
                class="inline-flex h-12 items-center gap-2 rounded-full border border-night/30 bg-white px-6 font-display font-semibold text-night transition-colors hover:bg-night-50"
              >
                <app-icon [name]="s.source === 'google' ? 'google' : 'map-pin'" [size]="18" />
                {{ 'reviews.openOn' | transloco: { source: ('reviews.source.' + s.source | transloco) } }}
              </a>
            </li>
          }
        </ul>
      </div>
    </section>

    <app-contact-cta placement="reviews_cta" />
  `,
})
export class ReviewsPage {
  protected readonly reviews = inject(ReviewsService);
  private readonly langs = inject(LangService);
  private readonly seo = inject(SeoService);

  constructor() {
    effect(() => {
      this.langs.lang();
      this.seo.set({
        title: this.langs.t('seo.reviews.title'),
        description: this.langs.t('seo.reviews.description'),
        path: '/reviews',
        jsonLd: [
          breadcrumbLd([
            { name: this.langs.t('breadcrumbs.home'), url: this.seo.url('/') },
            { name: this.langs.t('nav.reviews'), url: this.seo.url('/reviews') },
          ]),
        ],
      });
    });
  }
}
