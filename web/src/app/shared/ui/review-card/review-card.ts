import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LangService } from '../../../core/i18n/lang.service';
import type { Review } from '../../../core/models';
import { Icon } from '../icon/icon';
import { RatingStars } from '../rating-stars/rating-stars';

/** A review in its original language and wording, with a link to the source. */
@Component({
  selector: 'app-review-card',
  imports: [TranslocoPipe, Icon, RatingStars],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative flex flex-col rounded-card border border-line bg-white p-6 shadow-soft md:p-8' },
  template: `
    @let r = review();
    <div class="flex items-center justify-between gap-4">
      <app-rating-stars [value]="r.rating" class="text-sand-700" />
      <span class="sr-only">{{ 'reviews.ratingAria' | transloco: { value: r.rating } }}</span>
      <span class="inline-flex items-center gap-1.5 text-xs text-subtle">
        <app-icon [name]="r.source === 'google' ? 'google' : 'map-pin'" [size]="14" />
        {{ 'reviews.source.' + r.source | transloco }}
      </span>
    </div>
    <blockquote [attr.lang]="r.lang" class="mt-5 flex-1 text-[0.9375rem] leading-relaxed text-ink" [class.line-clamp-6]="clamp()">
      <p>{{ r.text }}</p>
    </blockquote>
    <div class="mt-6 flex items-end justify-between gap-4 border-t border-line pt-4">
      <div>
        <p class="font-display font-semibold text-night-950">{{ r.author }}</p>
        @if (foreign()) {
          <p class="mt-0.5 text-xs text-subtle">{{ 'reviews.originalIn.' + r.lang | transloco }}</p>
        }
      </div>
      @if (r.url) {
        <a [href]="r.url" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-sm text-night hover:underline">
          {{ 'reviews.onSource' | transloco }} <app-icon name="external-link" [size]="14" />
        </a>
      }
    </div>
  `,
})
export class ReviewCard {
  private readonly langs = inject(LangService);
  readonly review = input.required<Review>();
  readonly clamp = input(false);
  protected readonly foreign = computed(() => !!this.review().lang && this.review().lang !== this.langs.lang());
}
