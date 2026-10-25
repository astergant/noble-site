import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import type { Review } from '../../../core/models';
import { Icon } from '../icon/icon';
import { ReviewCard } from '../review-card/review-card';

/** Horizontal scroll-snap carousel; scrolls natively without JS, buttons are progressive enhancement. */
@Component({
  selector: 'app-reviews-carousel',
  imports: [TranslocoPipe, Icon, ReviewCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div role="region" aria-roledescription="carousel" [attr.aria-label]="label()">
      <ul
        #track
        tabindex="0"
        class="no-scrollbar -mx-[var(--page-gutter)] flex snap-x snap-mandatory scroll-px-[var(--page-gutter)] gap-4 overflow-x-auto px-[var(--page-gutter)] pb-2 outline-none focus-visible:ring-2 focus-visible:ring-night/40 md:gap-6"
        (scroll)="sync()"
      >
        @for (r of reviews(); track r.id; let i = $index) {
          <li
            class="relative flex w-[85%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
            aria-roledescription="slide"
            [attr.aria-label]="'reviews.slide' | transloco: { index: i + 1, total: reviews().length }"
          >
            <app-review-card [review]="r" [clamp]="clamp()" class="w-full" />
          </li>
        }
      </ul>
      <div class="mt-6 flex items-center gap-3">
        <button
          type="button"
          class="carousel-btn"
          [disabled]="atStart()"
          [attr.aria-label]="'reviews.prev' | transloco"
          (click)="step(-1)"
        >
          <app-icon name="chevron-left" [size]="20" />
        </button>
        <button
          type="button"
          class="carousel-btn"
          [disabled]="atEnd()"
          [attr.aria-label]="'reviews.next' | transloco"
          (click)="step(1)"
        >
          <app-icon name="chevron-right" [size]="20" />
        </button>
        <ng-content />
      </div>
    </div>
  `,
})
export class ReviewsCarousel {
  readonly reviews = input.required<Review[]>();
  readonly label = input.required<string>();
  readonly clamp = input(true);

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  protected readonly atStart = signal(true);
  protected readonly atEnd = signal(false);

  constructor() {
    const injector = inject(Injector);
    const destroyRef = inject(DestroyRef);
    afterNextRender(
      () => {
        this.sync();
        const onResize = () => this.sync();
        window.addEventListener('resize', onResize, { passive: true });
        destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));
      },
      { injector },
    );
  }

  protected sync(): void {
    const el = this.track().nativeElement;
    const max = el.scrollWidth - el.clientWidth;
    this.atStart.set(el.scrollLeft <= 4);
    this.atEnd.set(el.scrollLeft >= max - 4);
  }

  protected step(dir: 1 | -1): void {
    const el = this.track().nativeElement;
    const slide = el.querySelector('li');
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const width = slide ? slide.getBoundingClientRect().width + gap : el.clientWidth;
    const perView = Math.max(1, Math.floor((el.clientWidth + gap) / width));
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * width * perView, behavior: reduce ? 'auto' : 'smooth' });
  }
}
