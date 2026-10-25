import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { ContentService } from '../../core/data/content.service';
import { formatMoney } from '../../core/i18n/format';
import { LangService } from '../../core/i18n/lang.service';
import type { Service } from '../../core/models';
import { breadcrumbLd } from '../../core/seo/json-ld';
import { SeoService } from '../../core/seo/seo.service';
import { ContactCta } from '../../shared/ui/contact-cta/contact-cta';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHero } from '../../shared/ui/page-hero/page-hero';
import { PriceTable } from '../../shared/ui/price-table/price-table';

@Component({
  selector: 'app-prices-page',
  imports: [RouterLink, TranslocoPipe, PageHero, PriceTable, ContactCta, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      [title]="'pages.prices.title' | transloco"
      [eyebrow]="'pages.prices.eyebrow' | transloco"
      [lead]="'pages.prices.lead' | transloco"
      [crumbs]="[{ label: 'nav.prices' | transloco }]"
    />

    <div class="container-page py-section">
      <p class="flex max-w-3xl gap-3 rounded-card bg-sand-100 p-5 text-[0.9375rem] text-ink">
        <app-icon name="info" [size]="20" class="mt-0.5 shrink-0 text-sand-700" />
        {{ 'prices.note' | transloco }}
      </p>

      @for (g of groups; track g.category) {
        <section class="mt-14" [attr.aria-labelledby]="'prices-' + g.category">
          <h2 [id]="'prices-' + g.category" class="text-h3 text-night-950">{{ 'categories.' + g.category | transloco }}</h2>
          <div class="mt-5 divide-y divide-line border-y border-line">
            @for (s of g.services; track s.slug) {
              <details class="group" name="prices">
                <summary class="flex cursor-pointer list-none items-center gap-4 py-5 [&::-webkit-details-marker]:hidden">
                  <span class="flex-1 font-display text-lg text-night-950">{{ langs.pick(s.name) }}</span>
                  <span class="hidden text-sm text-subtle sm:inline">{{ langs.pick(s.duration) }}</span>
                  <span class="min-w-[7.5rem] text-right font-display text-lg font-semibold whitespace-nowrap text-night">
                    {{ 'common.priceFrom' | transloco: { value: money(s) } }}
                  </span>
                  <app-icon name="chevron-down" [size]="20" class="shrink-0 text-subtle transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div class="grid gap-8 pb-8 md:grid-cols-[1fr_22rem]">
                  <div>
                    <p class="text-muted">{{ langs.pick(s.short) }}</p>
                    <p class="mt-3 text-sm text-subtle sm:hidden">{{ 'common.duration' | transloco }}: {{ langs.pick(s.duration) }}</p>
                    <a [routerLink]="langs.link('/services/' + s.slug)" class="mt-4 inline-flex items-center gap-2 text-night hover:underline">
                      {{ 'prices.details' | transloco }} <app-icon name="arrow-right" [size]="16" />
                    </a>
                  </div>
                  <app-price-table [price]="s.price" />
                </div>
              </details>
            }
          </div>
        </section>
      }
    </div>

    <app-contact-cta placement="prices_cta" />
  `,
})
export class PricesPage {
  protected readonly langs = inject(LangService);
  private readonly seo = inject(SeoService);
  protected readonly groups = inject(ContentService).categories();

  protected money(s: Service): string {
    return formatMoney(s.price.from, s.price.currency, this.langs.lang());
  }

  constructor() {
    effect(() => {
      this.langs.lang();
      this.seo.set({
        title: this.langs.t('seo.prices.title'),
        description: this.langs.t('seo.prices.description'),
        path: '/prices',
        jsonLd: [
          breadcrumbLd([
            { name: this.langs.t('breadcrumbs.home'), url: this.seo.url('/') },
            { name: this.langs.t('nav.prices'), url: this.seo.url('/prices') },
          ]),
        ],
      });
    });
  }
}
