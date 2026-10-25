import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { filter, map } from 'rxjs';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { LANGS, type Lang } from '../../core/i18n/lang';
import { LangService } from '../../core/i18n/lang.service';

/** KA · RU · EN — keeps the current page, query and fragment. */
@Component({
  selector: 'app-lang-switcher',
  imports: [RouterLink, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="flex items-center" [class]="size() === 'lg' ? 'gap-2' : 'gap-0.5'" [attr.aria-label]="'common.language' | transloco">
      @for (l of langs; track l) {
        <li>
          <a
            [routerLink]="target(l).path"
            [queryParams]="target(l).query"
            [fragment]="target(l).fragment"
            [attr.hreflang]="l"
            [attr.lang]="l"
            [attr.aria-current]="l === current() ? 'true' : null"
            [attr.title]="'lang.' + l | transloco"
            (click)="onSwitch(l)"
            class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full font-display tracking-[0.14em] transition-colors"
            [class]="
              (size() === 'lg' ? 'px-4 text-base ' : 'px-2 text-[0.8125rem] ') +
              (l === current() ? 'text-sand' : 'text-white/75 hover:text-white')
            "
          >
            {{ l.toUpperCase() }}
          </a>
        </li>
      }
    </ul>
  `,
})
export class LangSwitcher {
  readonly size = input<'sm' | 'lg'>('sm');

  private readonly router = inject(Router);
  private readonly langService = inject(LangService);
  private readonly analytics = inject(AnalyticsService);

  protected readonly langs = LANGS;
  protected readonly current = this.langService.lang;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  private readonly parsed = computed(() => this.router.parseUrl(this.url()));

  protected target(lang: Lang) {
    const tree = this.parsed();
    const segments = tree.root.children['primary']?.segments.map((s) => s.path) ?? [];
    const rest = segments.slice(1).join('/');
    return {
      path: `/${lang}${rest ? '/' + rest : ''}`,
      query: tree.queryParams,
      fragment: tree.fragment ?? undefined,
    };
  }

  protected onSwitch(lang: Lang): void {
    if (lang !== this.current()) this.analytics.track('language_switch', { from: this.current(), to: lang });
  }
}
