import { ChangeDetectionStrategy, Component, ElementRef, inject, input, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ContactService } from '../../../core/config/contact.service';
import { SITE } from '../../../core/config/site.config';
import { Icon } from '../icon/icon';
import { LeadForm } from '../lead-form/lead-form';

/** One “Get in touch” control: site form, Telegram bot, call, WhatsApp. */
@Component({
  selector: 'app-contact-chooser',
  imports: [TranslocoPipe, Icon, LeadForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" [class]="btnClass()" (click)="open()">
      {{ 'contact.reach' | transloco }}
    </button>
    <dialog
      #dialog
      class="relative m-auto max-h-[min(90svh,40rem)] w-[min(26rem,calc(100vw-2rem))] overflow-y-auto rounded-card border-0 bg-white p-0 text-ink shadow-lift backdrop:bg-night-950/60"
      [attr.aria-labelledby]="'contact-chooser-title'"
    >
      <div class="p-4">
        <button
          type="button"
          class="absolute top-2 right-2 grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-mist hover:text-night"
          [attr.aria-label]="'common.close' | transloco"
          (click)="close()"
        >
          <app-icon name="x" [size]="18" />
        </button>
        <h2 id="contact-chooser-title" class="pr-10 font-display text-xl font-semibold text-night-950">
          {{ 'contact.chooserTitle' | transloco }}
        </h2>
        <div class="mt-4 grid gap-2">
          @if (contact.telegram) {
            <a
              [href]="contact.telegram"
              target="_blank"
              rel="noopener"
              (click)="contact.track('telegram', placement()); close()"
              class="inline-flex h-11 items-center gap-2 rounded-full bg-night px-5 font-display font-semibold text-white hover:bg-night-800"
            >
              <app-icon name="telegram" [size]="18" /> {{ 'contact.viaBot' | transloco }}
            </a>
          }
          <a
            [href]="contact.tel"
            (click)="contact.track('call', placement())"
            class="inline-flex h-11 items-center gap-2 rounded-full border border-night/30 px-5 font-display font-semibold text-night hover:bg-night-50"
          >
            <app-icon name="phone" [size]="18" /> {{ 'common.call' | transloco }}
          </a>
          @if (contact.whatsapp) {
            <a
              [href]="contact.whatsapp"
              target="_blank"
              rel="noopener"
              (click)="contact.track('whatsapp', placement())"
              class="inline-flex h-11 items-center gap-2 rounded-full border border-night/30 px-5 font-display font-semibold text-night hover:bg-night-50"
            >
              <app-icon name="whatsapp" [size]="18" /> {{ 'common.writeWhatsapp' | transloco }}
            </a>
          }
        </div>
        @if (site.features.leadForm) {
          <p class="mt-5 text-sm font-medium text-night-950">{{ 'contact.viaSite' | transloco }}</p>
          <app-lead-form class="mt-3" source="home" (sent)="close()" />
        }
      </div>
    </dialog>
  `,
})
export class ContactChooser {
  protected readonly contact = inject(ContactService);
  protected readonly site = inject(SITE);
  readonly placement = input.required<string>();
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected btnClass(): string {
    return 'inline-flex h-14 items-center justify-center rounded-full bg-sand px-8 font-display text-lg font-semibold text-night-950 transition-colors hover:bg-sand-300';
  }

  protected open(): void {
    this.dialog().nativeElement.showModal();
  }

  protected close(): void {
    this.dialog().nativeElement.close();
  }
}
