import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, isDevMode } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LangService } from '../../../core/i18n/lang.service';
import { media, mediaSrcset } from '../../../core/media/media';

/**
 * Photo from the media manifest in a fixed-ratio frame (no layout shift, blur-up placeholder).
 * Unknown or empty id renders a branded placeholder, marked in dev builds.
 */
@Component({
  selector: 'app-media-frame',
  imports: [NgOptimizedImage, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative block overflow-hidden',
    '[class.bg-night-900]': 'fit() === "cover"',
    '[style.aspect-ratio]': 'ratio() === "fill" ? null : ratio()',
  },
  template: `
    @if (entry(); as e) {
      <img
        [ngSrc]="id()"
        [ngSrcset]="srcset()"
        [sizes]="sizes()"
        [alt]="alt() ?? langs.pick(e.alt)"
        [priority]="priority()"
        [placeholder]="fit() === 'cover' ? e.blur : false"
        fill
        [class.object-cover]="fit() === 'cover'"
        [class.object-contain]="fit() === 'contain'"
        [class]="imgClass()"
        [style.object-position]="e.focal"
      />
    } @else {
      <div class="absolute inset-0 grid place-items-center bg-night text-sand/70" [class.demo-flag]="dev" role="img" [attr.aria-label]="'common.photoSoon' | transloco">
        <img src="/brand/crown-2.webp" width="1200" height="266" loading="lazy" alt="" aria-hidden="true" class="absolute inset-0 h-full w-full object-cover opacity-30" />
        <img src="/brand/sign-sand.webp" width="160" height="194" loading="lazy" alt="" aria-hidden="true" class="relative h-auto w-16 opacity-80" />
      </div>
    }
  `,
})
export class MediaFrame {
  protected readonly langs = inject(LangService);
  protected readonly dev = isDevMode();

  readonly id = input.required<string>();
  /** CSS aspect-ratio, e.g. "4 / 5"; "fill" stretches to the parent. */
  readonly ratio = input('4 / 5');
  readonly sizes = input('(min-width: 1024px) 33vw, 100vw');
  readonly priority = input(false);
  /** Overrides the manifest alt; pass '' for decorative images. */
  readonly alt = input<string>();
  readonly imgClass = input('');
  readonly fit = input<'cover' | 'contain'>('cover');

  protected readonly entry = computed(() => media(this.id()));
  protected readonly srcset = computed(() => {
    const e = this.entry();
    return e ? mediaSrcset(e) : '';
  });
}
