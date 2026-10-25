import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatMoney } from '../../../core/i18n/format';
import { LangService } from '../../../core/i18n/lang.service';
import type { Service } from '../../../core/models';
import { Icon } from '../icon/icon';
import { MediaFrame } from '../media-frame/media-frame';

/** Service tile: photo, name, short text, "from" price and turnaround. `featured` is the large PPF variant. */
@Component({
  selector: 'app-service-card',
  imports: [RouterLink, TranslocoPipe, Icon, MediaFrame],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let s = service();
    <a
      [routerLink]="langs.link('/services/' + s.slug)"
      class="group flex h-full flex-col overflow-hidden rounded-card border bg-white shadow-soft transition-shadow duration-500 hover:shadow-lift"
      [class.border-sand]="featured()"
      [class.border-line]="!featured()"
    >
      <div class="relative">
        <app-media-frame
          [id]="s.image"
          [ratio]="featured() ? '16 / 10' : '4 / 3'"
          [sizes]="featured() ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'"
          imgClass="transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
        />
        @if (s.flagship) {
          <span class="absolute top-4 left-4 rounded-full bg-night-950/80 px-3 py-1 text-xs font-medium tracking-wide text-sand backdrop-blur">
            {{ 'services.flagship' | transloco }}
          </span>
        }
      </div>
      <div class="flex flex-1 flex-col p-6" [class]="featured() ? 'md:p-8' : ''">
        <h3 class="text-night-950" [class.text-h3]="featured()" [class.text-h4]="!featured()">{{ langs.pick(s.name) }}</h3>
        <p class="mt-3 flex-1 text-[0.9375rem] text-muted">{{ langs.pick(s.short) }}</p>
        <dl class="mt-6 flex items-end justify-between gap-4 border-t border-line pt-4">
          <div>
            <dt class="sr-only">{{ 'common.price' | transloco }}</dt>
            <dd class="font-display text-xl font-semibold text-night">{{ 'common.priceFrom' | transloco: { value: price() } }}</dd>
          </div>
          <div class="text-right">
            <dt class="sr-only">{{ 'common.duration' | transloco }}</dt>
            <dd class="flex items-center gap-1.5 text-sm text-subtle">
              <app-icon name="clock" [size]="14" /> {{ langs.pick(s.duration) }}
            </dd>
          </div>
        </dl>
      </div>
    </a>
  `,
})
export class ServiceCard {
  protected readonly langs = inject(LangService);
  readonly service = input.required<Service>();
  readonly featured = input(false);
  protected readonly price = computed(() => formatMoney(this.service().price.from, this.service().price.currency, this.langs.lang()));
}
