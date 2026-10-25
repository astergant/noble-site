import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ContactService } from '../../../core/config/contact.service';
import { Icon } from '../icon/icon';

/** Primary CTA group: call (filled), WhatsApp and Instagram (outlined). Telegram follows its feature flag. */
@Component({
  selector: 'app-contact-buttons',
  imports: [TranslocoPipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-wrap gap-3' },
  template: `
    <a [href]="contact.tel" (click)="contact.track('call', placement())" [class]="btn() + ' ' + primary()">
      <app-icon name="phone" [size]="18" /> {{ 'common.call' | transloco }}
    </a>
    @if (contact.whatsapp) {
      <a
        [href]="contact.whatsapp"
        target="_blank"
        rel="noopener"
        (click)="contact.track('whatsapp', placement())"
        [class]="btn() + ' ' + secondary()"
      >
        <app-icon name="whatsapp" [size]="18" /> {{ 'common.writeWhatsapp' | transloco }}
      </a>
    }
    @if (instagram() && contact.instagram) {
      <a
        [href]="contact.instagram"
        target="_blank"
        rel="noopener"
        (click)="contact.track('instagram', placement())"
        [class]="btn() + ' ' + secondary()"
        [attr.aria-label]="'contact.instagramAria' | transloco"
      >
        <app-icon name="instagram" [size]="18" /> Instagram
      </a>
    }
    @if (contact.telegram) {
      <a
        [href]="contact.telegram"
        target="_blank"
        rel="noopener"
        (click)="contact.track('telegram', placement())"
        [class]="btn() + ' ' + secondary()"
      >
        <app-icon name="telegram" [size]="18" /> Telegram
      </a>
    }
  `,
})
export class ContactButtons {
  protected readonly contact = inject(ContactService);

  readonly placement = input.required<string>();
  readonly dark = input(true);
  readonly instagram = input(true);

  protected btn(): string {
    return 'inline-flex h-12 items-center gap-2 rounded-full px-6 font-display font-semibold transition-colors';
  }
  protected primary(): string {
    return this.dark() ? 'bg-sand text-night-950 hover:bg-sand-300' : 'bg-night text-white hover:bg-night-800';
  }
  protected secondary(): string {
    return this.dark()
      ? 'border border-sand/50 text-sand hover:border-sand hover:bg-sand/10'
      : 'border border-night/30 text-night hover:border-night hover:bg-night-50';
  }
}
