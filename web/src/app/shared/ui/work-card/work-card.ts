import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ContentService } from '../../../core/data/content.service';
import { LangService } from '../../../core/i18n/lang.service';
import { mediaLarge } from '../../../core/media/media';
import type { Work } from '../../../core/models';
import { Icon } from '../icon/icon';
import { MediaFrame } from '../media-frame/media-frame';

/** Portrait photo tile with the car and services; opens the photos in a lightbox (link to the large file without JS). */
@Component({
  selector: 'app-work-card',
  imports: [TranslocoPipe, MediaFrame, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let w = work();
    <a
      [href]="large()"
      class="group relative block cursor-zoom-in overflow-hidden rounded-card"
      [class.demo-flag]="w.demo"
      [attr.aria-label]="'works.openPhotos' | transloco: { car: w.car, count: w.gallery.length }"
      (click)="$event.preventDefault(); opened.emit()"
    >
      <app-media-frame
        [id]="w.cover"
        ratio="3 / 4"
        [sizes]="sizes()"
        imgClass="transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-night-950/90 via-night-950/10 to-transparent" aria-hidden="true"></div>
      <span
        class="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-night-950/60 px-2.5 py-1 text-xs text-white opacity-90 backdrop-blur-sm transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      >
        <app-icon name="image" [size]="14" />
        {{ w.gallery.length }}
      </span>
      <div class="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <p class="text-xs tracking-[0.14em] text-sand uppercase">{{ services() }}</p>
        <h3 class="mt-1.5 text-h4 text-white">{{ w.car }}</h3>
      </div>
    </a>
  `,
})
export class WorkCard {
  private readonly langs = inject(LangService);
  private readonly content = inject(ContentService);
  readonly work = input.required<Work>();
  readonly sizes = input('(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw');
  readonly opened = output<void>();

  protected readonly large = computed(() => mediaLarge(this.work().cover));
  protected readonly services = computed(() => this.content.serviceNames(this.work(), this.langs.lang()));
}
