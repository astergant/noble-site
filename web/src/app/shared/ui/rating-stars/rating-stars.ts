import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Five stars; partial fill for fractional ratings. Decorative — callers provide the text equivalent. */
@Component({
  selector: 'app-rating-stars',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex gap-0.5', 'aria-hidden': 'true' },
  template: `
    @for (fill of fills(); track $index) {
      <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" class="shrink-0">
        <defs>
          <linearGradient [attr.id]="uid + $index">
            <stop [attr.offset]="fill" stop-color="currentColor" />
            <stop [attr.offset]="fill" stop-color="currentColor" stop-opacity="0.25" />
          </linearGradient>
        </defs>
        <path
          [attr.fill]="'url(#' + uid + $index + ')'"
          d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
        />
      </svg>
    }
  `,
})
export class RatingStars {
  private static seq = 0;
  protected readonly uid = `star-${RatingStars.seq++}-`;

  readonly value = input.required<number>();
  readonly size = input(16);

  protected readonly fills = computed(() =>
    [0, 1, 2, 3, 4].map((i) => `${Math.round(Math.min(1, Math.max(0, this.value() - i)) * 100)}%`),
  );
}
