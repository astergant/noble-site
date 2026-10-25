import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatRating } from '../../../core/i18n/format';
import { LangService } from '../../../core/i18n/lang.service';
import { ReviewsService } from '../../../core/reviews/reviews';
import { Icon } from '../icon/icon';
import { RatingStars } from '../rating-stars/rating-stars';

/** Rating cards per source (Google, Yandex Maps), each linking to the public reviews page. */
@Component({
  selector: 'app-rating-summary',
  imports: [TranslocoPipe, Icon, RatingStars],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="flex flex-wrap gap-4">
      @for (s of reviews.summaries; track s.source) {
        <li>
          <a
            [href]="s.url"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-4 rounded-card border px-5 py-4 transition-colors"
            [class]="
              dark()
                ? 'border-white/15 hover:border-sand/60'
                : 'border-line bg-white shadow-soft hover:border-night/30'
            "
          >
            <app-icon
              [name]="s.source === 'google' ? 'google' : 'map-pin'"
              [size]="28"
              [class]="dark() ? 'text-white' : s.source === 'yandex' ? 'text-[#fc3f1d]' : 'text-night'"
            />
            <span>
              <span class="flex items-center gap-2">
                <span class="font-display text-2xl font-semibold" [class]="dark() ? 'text-sand' : 'text-night-950'">
                  {{ rating(s.value!) }}
                </span>
                <app-rating-stars [value]="s.value!" [class]="dark() ? 'text-sand' : 'text-sand-700'" />
              </span>
              <span class="flex items-center gap-1 text-sm" [class]="dark() ? 'text-white/65' : 'text-subtle'">
                {{
                  (s.source === 'yandex' ? 'reviews.summaryRatings' : 'reviews.summary')
                    | transloco: { source: ('reviews.source.' + s.source | transloco), count: s.count }
                }}
                <app-icon name="external-link" [size]="12" />
              </span>
            </span>
          </a>
        </li>
      }
    </ul>
  `,
})
export class RatingSummary {
  protected readonly reviews = inject(ReviewsService);
  private readonly langs = inject(LangService);
  readonly dark = input(false);

  protected rating(v: number): string {
    return formatRating(v, this.langs.lang());
  }
}
