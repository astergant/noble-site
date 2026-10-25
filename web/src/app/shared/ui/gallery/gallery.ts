import { ChangeDetectionStrategy, Component, computed, inject, input, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LangService } from '../../../core/i18n/lang.service';
import { media, mediaLarge } from '../../../core/media/media';
import { Reveal } from '../reveal.directive';
import { MediaFrame } from '../media-frame/media-frame';
import { Lightbox } from './lightbox';

/**
 * Photo grid that opens a lightbox. Each tile links to the large file, so photos open without JS too.
 * `layout="mosaic"` makes the first photo span two columns and rows on wide screens.
 */
@Component({
  selector: 'app-gallery',
  imports: [TranslocoPipe, MediaFrame, Lightbox, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <ul class="grid grid-cols-2 gap-2 md:gap-3" [class]="gridClass()">
      @for (id of items(); track id; let i = $index; let last = $last) {
        @let wide = layout() === 'mosaic' && (i === 0 || (last && fillLast()));
        <li [class]="layout() === 'mosaic' && i === 0 ? 'col-span-2 row-span-2' : wide ? 'col-span-2' : ''" [appReveal]="(i % 4) * 60">
          <a
            [href]="large(id)"
            class="group relative block h-full overflow-hidden rounded-control"
            [attr.aria-label]="'lightbox.open' | transloco: { alt: alt(id) }"
            (click)="$event.preventDefault(); lightbox().open(i)"
          >
            <app-media-frame
              [id]="id"
              [ratio]="wide ? 'fill' : ratio()"
              [sizes]="wide ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 25vw, 50vw'"
              [class.h-full]="wide"
              [class.min-h-64]="wide"
              imgClass="transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
            />
          </a>
        </li>
      }
    </ul>
    <app-lightbox [items]="items()" />
  `,
})
export class Gallery {
  private readonly langs = inject(LangService);
  protected readonly lightbox = viewChild.required(Lightbox);

  readonly items = input.required<string[]>();
  readonly ratio = input('4 / 3');
  readonly layout = input<'grid' | 'mosaic'>('grid');
  readonly columns = input(4);

  /** Mosaic on 4 columns: first tile takes 4 cells; widen the last tile when one cell would stay empty. */
  protected readonly fillLast = computed(() => (this.items().length + 3) % 4 === 3);

  protected readonly gridClass = computed(() => (this.columns() >= 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'));

  protected large(id: string): string {
    return mediaLarge(id);
  }

  protected alt(id: string): string {
    return this.langs.pick(media(id)?.alt);
  }
}
