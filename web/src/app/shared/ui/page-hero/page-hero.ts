import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Breadcrumbs, type Crumb } from '../breadcrumbs/breadcrumbs';

/** Dark heading block for inner pages: breadcrumbs, eyebrow, H1, lead, crown ribbon. */
@Component({
  selector: 'app-page-hero',
  imports: [Breadcrumbs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'on-dark relative block overflow-hidden bg-night text-white' },
  template: `
    <img
      src="/brand/crown-2.webp"
      alt=""
      aria-hidden="true"
      class="pointer-events-none absolute -right-24 -bottom-10 w-[38rem] max-w-none opacity-60 select-none"
    />
    <div class="container-page relative pt-10 pb-20 md:pt-14 md:pb-28">
      <app-breadcrumbs [items]="crumbs()" />
      @if (eyebrow()) {
        <p class="eyebrow mt-12 md:mt-16">{{ eyebrow() }}</p>
      }
      <h1 class="mt-4 max-w-4xl text-h1 text-balance text-white hyphens-auto [overflow-wrap:anywhere]">{{ title() }}</h1>
      @if (lead()) {
        <p class="mt-6 max-w-2xl text-lead text-white/75">{{ lead() }}</p>
      }
      <ng-content />
    </div>
    <div class="crown-row relative opacity-80" aria-hidden="true"></div>
  `,
})
export class PageHero {
  readonly title = input.required<string>();
  readonly eyebrow = input<string>('');
  readonly lead = input<string>('');
  readonly crumbs = input<Crumb[]>([]);
}
