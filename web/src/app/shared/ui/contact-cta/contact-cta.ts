import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { SITE } from '../../../core/config/site.config';
import { ContactButtons } from '../contact-buttons/contact-buttons';

/** Closing call-to-action band, placed right before the footer. */
@Component({
  selector: 'app-contact-cta',
  imports: [TranslocoPipe, ContactButtons],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'on-dark relative block overflow-hidden bg-night text-white' },
  template: `
    <img
      src="/brand/crown-2.webp"
      alt=""
      aria-hidden="true"
      loading="lazy"
      class="pointer-events-none absolute -bottom-16 -left-24 w-[34rem] max-w-none opacity-40 select-none"
    />
    <div class="container-page relative grid gap-8 py-section md:grid-cols-[1.3fr_1fr] md:items-end">
      <div>
        <p class="eyebrow">{{ 'cta.eyebrow' | transloco }}</p>
        <h2 class="mt-3 text-h2 text-white">{{ (title() || 'cta.title') | transloco }}</h2>
        <p class="mt-4 max-w-xl text-lead text-white/75">
          {{ 'cta.text' | transloco: { minutes: site.responseTimeMinutes } }}
        </p>
        <p class="mt-3 text-sm text-white/75">{{ 'common.exactPrice' | transloco }}</p>
      </div>
      <app-contact-buttons [placement]="placement()" class="md:justify-end" />
    </div>
  `,
})
export class ContactCta {
  protected readonly site = inject(SITE);
  readonly placement = input.required<string>();
  /** Translation key overriding the default title. */
  readonly title = input('');
}
