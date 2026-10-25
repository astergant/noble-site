import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { ConsentService } from '../../core/analytics/consent.service';
import { LangService } from '../../core/i18n/lang.service';

/** Rendered only in the browser (after hydration), never in prerendered HTML. */
@Component({
  selector: 'app-cookie-banner',
  imports: [RouterLink, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        role="region"
        aria-live="polite"
        [attr.aria-label]="'cookies.policy' | transloco"
        animate.enter="cookie-enter"
        animate.leave="cookie-leave"
        class="on-dark fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 rounded-card border border-line-dark bg-night-900/97 p-5 text-white shadow-lift backdrop-blur-md md:inset-x-auto md:bottom-6 md:left-6 md:max-w-md"
      >
        <p class="text-[0.9375rem] leading-relaxed text-white/85">
          {{ 'cookies.text' | transloco }}
          <a [routerLink]="langs.link('/privacy')" class="text-sand underline underline-offset-4">{{ 'cookies.policy' | transloco }}</a>
        </p>
        <div class="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            (click)="consent.set('granted')"
            class="h-11 rounded-full bg-sand px-6 font-display font-semibold text-night-950 transition-colors hover:bg-sand-300"
          >
            {{ 'cookies.accept' | transloco }}
          </button>
          <button
            type="button"
            (click)="consent.set('denied')"
            class="h-11 rounded-full border border-line-dark px-6 text-white/85 transition-colors hover:border-sand hover:text-sand"
          >
            {{ 'cookies.decline' | transloco }}
          </button>
        </div>
      </div>
    }
  `,
})
export class CookieBanner {
  protected readonly consent = inject(ConsentService);
  protected readonly langs = inject(LangService);
  private readonly hydrated = signal(false);
  protected readonly visible = computed(() => this.hydrated() && this.consent.state() === 'unknown');

  constructor() {
    afterNextRender(() => this.hydrated.set(true));
  }
}
