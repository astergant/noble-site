import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LangService } from '../../../core/i18n/lang.service';
import { Icon } from '../icon/icon';

export interface Crumb {
  label: string;
  /** Path without language prefix. Omit for the current page. */
  path?: string;
}

@Component({
  selector: 'app-breadcrumbs',
  imports: [RouterLink, TranslocoPipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav [attr.aria-label]="'breadcrumbs.aria' | transloco">
      <ol class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/75">
        <li>
          <a [routerLink]="langs.link('/')" class="transition-colors hover:text-sand">{{ 'breadcrumbs.home' | transloco }}</a>
        </li>
        @for (c of items(); track c.label; let last = $last) {
          <li class="flex items-center gap-2">
            <app-icon name="chevron-right" [size]="14" class="text-white/35" />
            @if (c.path && !last) {
              <a [routerLink]="langs.link(c.path)" class="transition-colors hover:text-sand">{{ c.label }}</a>
            } @else {
              <span aria-current="page" class="text-white/85">{{ c.label }}</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class Breadcrumbs {
  readonly items = input.required<Crumb[]>();
  protected readonly langs = inject(LangService);
}
