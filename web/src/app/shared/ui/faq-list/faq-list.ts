import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { LangService } from '../../../core/i18n/lang.service';
import type { Faq } from '../../../core/models';
import { Icon } from '../icon/icon';

/** Questions as a native <details> accordion: works without JS and is indexed as plain text. */
@Component({
  selector: 'app-faq-list',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="divide-y divide-line border-y border-line">
      @for (f of items(); track f.id) {
        <details class="group" [attr.name]="name()" [id]="'faq-' + f.id">
          <summary class="flex cursor-pointer list-none items-start gap-4 py-5 [&::-webkit-details-marker]:hidden">
            <span class="flex-1 font-display text-lg text-night-950">{{ langs.pick(f.q) }}</span>
            <app-icon
              name="chevron-down"
              [size]="20"
              class="mt-1 shrink-0 text-subtle transition-transform duration-300 group-open:rotate-180"
            />
          </summary>
          <p class="max-w-3xl pb-6 text-[0.9375rem] leading-relaxed text-muted">{{ langs.pick(f.a) }}</p>
        </details>
      }
    </div>
  `,
})
export class FaqList {
  protected readonly langs = inject(LangService);
  readonly items = input.required<Faq[]>();
  /** Same name on <details> makes the group exclusive (one open at a time). */
  readonly name = input('faq');
}
