import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslocoPipe } from '@jsverse/transloco';
import { SITE } from '../../../core/config/site.config';
import { LangService } from '../../../core/i18n/lang.service';
import { Icon } from '../icon/icon';

/** Yandex has no Georgian UI; Georgian visitors get the English map. */
const YANDEX_LANG = { ka: 'en_US', ru: 'ru_RU', en: 'en_US' } as const;

/**
 * Yandex Maps widget with the studio pin, plus address and route buttons.
 * The iframe loads lazily; until then the address card is already readable.
 */
@Component({
  selector: 'app-map-embed',
  imports: [TranslocoPipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block overflow-hidden rounded-card bg-night-50 shadow-soft' },
  template: `
    <iframe
      [src]="src()"
      [title]="'map.title' | transloco"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      allowfullscreen
      class="block h-[22rem] w-full border-0 md:h-[28rem]"
      [style.height]="height() || null"
    ></iframe>
    <div class="absolute inset-x-3 bottom-3 rounded-control bg-white/95 p-4 shadow-lift backdrop-blur md:inset-x-auto md:left-4 md:max-w-sm">
      <p class="flex gap-2 font-display text-night-950">
        <app-icon name="map-pin" [size]="18" class="mt-0.5 shrink-0 text-night" />
        <span>{{ langs.pick(site.address) }}</span>
      </p>
      <div class="mt-3 flex flex-wrap gap-2 text-sm">
        <a
          [href]="site.maps.google"
          target="_blank"
          rel="noopener"
          class="inline-flex h-9 items-center gap-1.5 rounded-full bg-night px-4 text-white transition-colors hover:bg-night-800"
        >
          <app-icon name="navigation" [size]="14" /> Google Maps
        </a>
        <a
          [href]="site.maps.yandex"
          target="_blank"
          rel="noopener"
          class="inline-flex h-9 items-center gap-1.5 rounded-full border border-night/30 px-4 text-night transition-colors hover:bg-night-50"
        >
          <app-icon name="navigation" [size]="14" /> {{ 'map.yandex' | transloco }}
        </a>
      </div>
    </div>
  `,
})
export class MapEmbed {
  protected readonly site = inject(SITE);
  protected readonly langs = inject(LangService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly height = input('');

  protected readonly src = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(`${this.site.maps.yandexWidget}&lang=${YANDEX_LANG[this.langs.lang()]}`),
  );
}
