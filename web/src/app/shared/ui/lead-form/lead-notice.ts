import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Icon } from '../icon/icon';
import { LeadNoticeService } from './lead-notice.service';

@Component({
  selector: 'app-lead-notice',
  imports: [TranslocoPipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog
      #dialog
      class="relative m-auto w-[min(26rem,calc(100vw-2rem))] rounded-card border-0 bg-white p-0 text-ink shadow-lift backdrop:bg-night-950/60"
      [attr.aria-labelledby]="'lead-notice-title'"
      (close)="notice.hide()"
    >
      <div class="p-6 pr-14">
        <button
          type="button"
          class="absolute top-3 right-3 grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-mist hover:text-night"
          [attr.aria-label]="'common.close' | transloco"
          (click)="close()"
        >
          <app-icon name="x" [size]="20" />
        </button>
        <p id="lead-notice-title" class="font-display text-lg font-semibold text-night-950" role="status">
          {{ 'lead.accepted' | transloco }}
        </p>
      </div>
    </dialog>
  `,
})
export class LeadNotice {
  protected readonly notice = inject(LeadNoticeService);
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const el = this.dialog()?.nativeElement;
      if (!el) return;
      if (this.notice.open()) {
        if (!el.open) el.showModal();
      } else if (el.open) {
        el.close();
      }
    });
  }

  protected close(): void {
    this.dialog()?.nativeElement.close();
  }
}
