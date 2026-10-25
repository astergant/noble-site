import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { RichBlock } from '../../../core/models';

/** Renders article / legal text blocks as plain HTML elements (no innerHTML). */
@Component({
  selector: 'app-rich-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block max-w-[42rem] text-[1.0625rem] leading-[1.75] text-ink' },
  template: `
    @for (b of blocks(); track $index) {
      @if ('h2' in b) {
        <h2 class="mt-12 mb-4 text-h3 text-night-950 first:mt-0">{{ b.h2 }}</h2>
      } @else if ('ul' in b) {
        <ul class="my-5 space-y-2.5">
          @for (li of b.ul; track $index) {
            <li class="flex gap-3">
              <span class="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-sand-700" aria-hidden="true"></span>
              <span>{{ li }}</span>
            </li>
          }
        </ul>
      } @else {
        <p class="my-5 whitespace-pre-line text-muted first:mt-0">{{ b.p }}</p>
      }
    }
  `,
})
export class RichText {
  readonly blocks = input.required<RichBlock[]>();
}
