import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatMoney } from '../../../core/i18n/format';
import { LangService } from '../../../core/i18n/lang.service';
import type { Price } from '../../../core/models';

/** "From" prices by car class (or a single line), with the optional note. */
@Component({
  selector: 'app-price-table',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let p = price();
    <table class="w-full text-left text-[0.9375rem]">
      <caption class="sr-only">{{ 'common.price' | transloco }}</caption>
      @if (rows().length) {
        <thead class="text-xs tracking-[0.12em] text-subtle uppercase">
          <tr>
            <th scope="col" class="pb-3 font-medium">{{ 'prices.carClass' | transloco }}</th>
            <th scope="col" class="pb-3 text-right font-medium">{{ 'common.price' | transloco }}</th>
            @if (hasArches()) {
              <th scope="col" class="pb-3 text-right font-medium">{{ 'priceVariants.withArches' | transloco }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (r of rows(); track r.key) {
            <tr class="border-t border-line">
              <th scope="row" class="py-3 pr-4 font-normal text-ink">{{ 'priceVariants.' + r.key | transloco }}</th>
              <td class="py-3 text-right font-display font-semibold whitespace-nowrap text-night">
                {{ 'common.priceFrom' | transloco: { value: r.from } }}
              </td>
              @if (hasArches()) {
                <td class="py-3 pl-4 text-right font-display font-semibold whitespace-nowrap text-night">
                  {{ r.arches ? ('common.priceFrom' | transloco: { value: r.arches }) : '—' }}
                </td>
              }
            </tr>
          }
        </tbody>
      } @else {
        <tbody>
          <tr class="border-t border-line">
            <th scope="row" class="py-3 pr-4 font-normal text-ink">{{ 'prices.base' | transloco }}</th>
            <td class="py-3 text-right font-display font-semibold text-night">{{ 'common.priceFrom' | transloco: { value: from() } }}</td>
          </tr>
        </tbody>
      }
    </table>
    @if (p.note) {
      <p class="mt-3 text-sm text-subtle">{{ langs.pick(p.note) }}</p>
    }
  `,
})
export class PriceTable {
  protected readonly langs = inject(LangService);
  readonly price = input.required<Price>();

  private money(v: number): string {
    return formatMoney(v, this.price().currency, this.langs.lang());
  }

  protected readonly from = computed(() => this.money(this.price().from));
  protected readonly rows = computed(() =>
    (this.price().variants ?? []).map((v) => ({
      key: v.key,
      from: this.money(v.from),
      arches: v.withArchesFrom ? this.money(v.withArchesFrom) : '',
    })),
  );
  protected readonly hasArches = computed(() => this.rows().some((r) => r.arches));
}
