import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ContactService } from '../../core/config/contact.service';
import { Icon } from '../../shared/ui/icon/icon';

/** Desktop: round buttons bottom-right. Mobile (< md): bottom bar Call · WhatsApp · Instagram. */
@Component({
  selector: 'app-floating-contacts',
  imports: [TranslocoPipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'on-dark' },
  template: `
    <nav
      [attr.aria-label]="'contact.floatingAria' | transloco"
      class="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line-dark bg-night-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md [view-transition-name:contact-bar] md:hidden"
    >
      <a
        [href]="contact.tel"
        (click)="contact.track('call', 'bottom_bar')"
        class="flex min-h-14 flex-col items-center justify-center gap-1 text-xs text-sand"
      >
        <app-icon name="phone" [size]="20" />
        {{ 'common.call' | transloco }}
      </a>
      @if (contact.whatsapp) {
        <a
          [href]="contact.whatsapp"
          target="_blank"
          rel="noopener"
          (click)="contact.track('whatsapp', 'bottom_bar')"
          class="flex min-h-14 flex-col items-center justify-center gap-1 border-x border-line-dark text-xs text-white/85"
        >
          <app-icon name="whatsapp" [size]="20" />
          WhatsApp
        </a>
      }
      @if (contact.telegram) {
        <a
          [href]="contact.telegram"
          target="_blank"
          rel="noopener"
          (click)="contact.track('telegram', 'bottom_bar')"
          class="flex min-h-14 flex-col items-center justify-center gap-1 border-l border-line-dark text-xs text-white/85"
        >
          <app-icon name="telegram" [size]="20" />
          Telegram
        </a>
      }
      @if (contact.instagram) {
        <a
          [href]="contact.instagram"
          target="_blank"
          rel="noopener"
          (click)="contact.track('instagram', 'bottom_bar')"
          class="flex min-h-14 flex-col items-center justify-center gap-1 text-xs text-white/85"
        >
          <app-icon name="instagram" [size]="20" />
          Instagram
        </a>
      }
    </nav>

    <div class="fixed right-6 bottom-6 z-30 hidden flex-col gap-3 [view-transition-name:contact-fab] md:flex">
      @if (contact.whatsapp) {
        <a
          [href]="contact.whatsapp"
          target="_blank"
          rel="noopener"
          (click)="contact.track('whatsapp', 'floating')"
          class="fab"
          [attr.aria-label]="'contact.whatsappAria' | transloco"
        >
          <app-icon name="whatsapp" [size]="22" />
        </a>
      }
      @if (contact.telegram) {
        <a
          [href]="contact.telegram"
          target="_blank"
          rel="noopener"
          (click)="contact.track('telegram', 'floating')"
          class="fab"
          [attr.aria-label]="'contact.telegramAria' | transloco"
        >
          <app-icon name="telegram" [size]="20" />
        </a>
      }
      @if (contact.instagram) {
        <a
          [href]="contact.instagram"
          target="_blank"
          rel="noopener"
          (click)="contact.track('instagram', 'floating')"
          class="fab"
          [attr.aria-label]="'contact.instagramAria' | transloco"
        >
          <app-icon name="instagram" [size]="20" />
        </a>
      }
      <a
        [href]="contact.tel"
        (click)="contact.track('call', 'floating')"
        class="fab fab-primary"
        [attr.aria-label]="'contact.callAria' | transloco: { phone: contact.site.phoneDisplay }"
      >
        <app-icon name="phone" [size]="20" />
      </a>
    </div>
  `,
  styles: `
    .fab {
      display: inline-flex;
      width: 3.25rem;
      height: 3.25rem;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      background: var(--color-night);
      color: var(--color-sand);
      box-shadow: var(--shadow-glow);
      transition: transform 0.3s var(--ease-out-soft), background-color 0.3s;
    }
    .fab:hover {
      transform: translateY(-3px);
      background: var(--color-night-700);
    }
    .fab-primary {
      background: var(--color-sand);
      color: var(--color-night-950);
    }
    .fab-primary:hover {
      background: var(--color-sand-300);
    }
  `,
})
export class FloatingContacts {
  protected readonly contact = inject(ContactService);
}
