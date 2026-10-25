import { Injectable, InjectionToken, inject } from '@angular/core';
import { SITE } from '../config/site.config';
import type { RatingSummary, Review, SiteConfig } from '../models';
import reviews from '../../data/reviews.json';

/** A source of reviews and its rating. Providers must not scrape Google or Yandex pages. */
export interface ReviewsProvider {
  readonly source: Review['source'];
  reviews(): Review[];
  summary(): RatingSummary;
}

/** Reviews copied by hand into data/reviews.json (original text, no edits). */
export class ManualJsonProvider implements ReviewsProvider {
  constructor(
    readonly source: Review['source'],
    private readonly site: SiteConfig,
  ) {}

  reviews(): Review[] {
    const url = this.site.rating[this.source].url;
    return (reviews as Review[]).filter((r) => r.source === this.source).map((r) => ({ url, ...r }));
  }

  summary(): RatingSummary {
    const { value, count, url } = this.site.rating[this.source];
    return { source: this.source, value, count, url };
  }
}

/**
 * Placeholder for Yandex Maps. Yandex has no public reviews API; when the studio has reviews there,
 * add them to reviews.json with source "yandex" and set rating.yandex in site.json.
 */
export class YandexProvider extends ManualJsonProvider {
  constructor(site: SiteConfig) {
    super('yandex', site);
  }
}

export const REVIEWS_PROVIDERS = new InjectionToken<ReviewsProvider[]>('REVIEWS_PROVIDERS', {
  providedIn: 'root',
  factory: () => {
    const site = inject(SITE);
    return [new ManualJsonProvider('google', site), new YandexProvider(site)];
  },
});

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private readonly providers = inject(REVIEWS_PROVIDERS);

  /** Google first, then other sources; only sources with a published rating. */
  readonly summaries: RatingSummary[] = this.providers.map((p) => p.summary()).filter((s) => s.value != null);
  readonly all: Review[] = this.providers.flatMap((p) => p.reviews());
}
