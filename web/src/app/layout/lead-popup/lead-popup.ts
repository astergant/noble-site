import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { SITE } from '../../core/config/site.config';
import { Icon } from '../../shared/ui/icon/icon';
import { LeadForm } from '../../shared/ui/lead-form/lead-form';

const DELAY_MS = 25_000;
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;
const DONE = 'noble.lead.discount.done';
const DISMISSED = 'noble.lead.discount.dismissedAt';
const SENT = 'noble.lead.sent';

/** Delayed native dialog. Shown once per week unless the visitor already left a request. */
@Component({
  selector: 'app-lead-popup',
  imports: [TranslocoPipe, Icon, LeadForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog
      #dialog
      class="lead-popup relative m-auto w-[min(28rem,calc(100vw-2rem))] rounded-card border-0 bg-white p-0 text-ink shadow-lift backdrop:bg-night-950/60"
      [attr.aria-labelledby]="'lead-popup-title'"
      (close)="onClose()"
    >
      <div class="p-6 md:p-8">
        <button
          type="button"
          class="absolute top-3 right-3 grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-mist hover:text-night"
          [attr.aria-label]="'common.close' | transloco"
          (click)="close()"
        >
          <app-icon name="x" [size]="20" />
        </button>
        <p class="eyebrow text-sand-700">{{ 'lead.popup.eyebrow' | transloco }}</p>
        <h2 id="lead-popup-title" class="mt-2 pr-8 text-h3 text-night-950">{{ 'lead.popup.title' | transloco }}</h2>
        <p class="mt-3 text-sm text-muted">{{ 'lead.popup.lead' | transloco }}</p>
        <app-lead-form class="mt-6" source="popup_discount" (sent)="onSent()" />
      </div>
    </dialog>
  `,
})
export class LeadPopup {
  private readonly site = inject(SITE);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private opened = false;
  private timer = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (!this.site.features.leadForm) return;
      if (this.blocked()) return;
      this.timer = window.setTimeout(() => this.open(), DELAY_MS);
      destroyRef.onDestroy(() => window.clearTimeout(this.timer));
    });
  }

  private blocked(): boolean {
    try {
      if (localStorage.getItem(DONE) || sessionStorage.getItem(SENT)) return true;
      const at = Number(localStorage.getItem(DISMISSED) || 0);
      return at > 0 && Date.now() - at < DISMISS_MS;
    } catch {
      return false;
    }
  }

  private open(): void {
    if (this.opened || this.blocked()) return;
    const el = document.activeElement as HTMLElement | null;
    if (el?.closest('app-lead-form')) return;
    this.opened = true;
    this.dialog().nativeElement.showModal();
  }

  protected close(): void {
    this.dialog().nativeElement.close();
  }

  protected onClose(): void {
    try {
      if (!localStorage.getItem(DONE)) localStorage.setItem(DISMISSED, String(Date.now()));
    } catch {
      /* convenience only */
    }
  }

  protected onSent(): void {
    window.setTimeout(() => this.close(), 1600);
  }
}
