import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ContactService } from '../../../core/config/contact.service';
import { LangService } from '../../../core/i18n/lang.service';
import { Icon } from '../icon/icon';
import { MapEmbed } from '../map-embed/map-embed';
import { StatusChip } from '../status-chip/status-chip';

/** Address, phone, messengers and hours next to the map. */
@Component({
  selector: 'app-contact-details',
  imports: [TranslocoPipe, Icon, MapEmbed, StatusChip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'grid gap-8 lg:grid-cols-[22rem_1fr] lg:gap-12' },
  template: `
    <dl class="space-y-6 text-[0.9375rem]">
      <div class="relative pl-9">
        <dt class="text-subtle"><app-icon name="map-pin" [size]="20" class="absolute top-0.5 left-0 text-sand-700" />{{ 'contacts.address' | transloco }}</dt>
          <dd class="mt-1 font-display text-lg text-night-950">{{ langs.pick(site.address) }}</dd>
      </div>
      <div class="relative pl-9">
        <dt class="text-subtle"><app-icon name="phone" [size]="20" class="absolute top-0.5 left-0 text-sand-700" />{{ 'contacts.phone' | transloco }}</dt>
          <dd class="mt-1">
            <a [href]="contact.tel" (click)="contact.track('call', placement())" class="font-display text-lg text-night-950 hover:underline">
              {{ site.phoneDisplay }}
            </a>
          </dd>
      </div>
      <div class="relative pl-9">
        <dt class="text-subtle"><app-icon name="clock" [size]="20" class="absolute top-0.5 left-0 text-sand-700" />{{ 'footer.hours' | transloco }}</dt>
          <dd class="mt-1 font-display text-lg text-night-950">
            {{ 'status.daily' | transloco: { open: hours.open, close: hours.close } }}
          </dd>
          <dd class="mt-2"><app-status-chip tone="light" /></dd>
      </div>
      <div class="relative pl-9">
        <dt class="text-subtle"><app-icon name="sparkles" [size]="20" class="absolute top-0.5 left-0 text-sand-700" />{{ 'contacts.write' | transloco }}</dt>
          <dd class="mt-2 flex flex-wrap gap-2">
            @if (contact.whatsapp) {
              <a
                [href]="contact.whatsapp"
                target="_blank"
                rel="noopener"
                (click)="contact.track('whatsapp', placement())"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-night/25 px-4 text-night transition-colors hover:bg-night-50"
              >
                <app-icon name="whatsapp" [size]="16" /> WhatsApp
              </a>
            }
            @if (contact.instagram) {
              <a
                [href]="contact.instagram"
                target="_blank"
                rel="noopener"
                (click)="contact.track('instagram', placement())"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-night/25 px-4 text-night transition-colors hover:bg-night-50"
              >
                <app-icon name="instagram" [size]="16" /> &#64;{{ site.instagram }}
              </a>
            }
          </dd>
          <dd class="mt-3 text-sm text-subtle">{{ 'common.responseTime' | transloco: { minutes: site.responseTimeMinutes } }}</dd>
      </div>
    </dl>
    <app-map-embed />
  `,
})
export class ContactDetails {
  protected readonly langs = inject(LangService);
  protected readonly contact = inject(ContactService);
  protected readonly site = this.contact.site;
  protected readonly hours = this.site.hours.schedule[0]!;
  readonly placement = input.required<string>();
}
