import { ChangeDetectionStrategy, Component, RESPONSE_INIT, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LangService } from '../../core/i18n/lang.service';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="on-dark relative overflow-hidden bg-night text-white">
      <div class="container-page flex min-h-[70svh] flex-col justify-center py-24">
        <p class="font-display text-[clamp(5rem,18vw,12rem)] leading-none font-semibold text-sand/25">
          {{ 'notFound.code' | transloco }}
        </p>
        <h1 class="mt-4 text-h2">{{ 'notFound.title' | transloco }}</h1>
        <p class="mt-4 max-w-lg text-lead text-white/75">{{ 'notFound.text' | transloco }}</p>
        <div class="mt-10 flex flex-wrap gap-3">
          <a
            [routerLink]="langs.link('/')"
            class="inline-flex h-12 items-center rounded-full bg-sand px-6 font-display font-semibold text-night-950"
            >{{ 'notFound.home' | transloco }}</a
          >
          <a
            [routerLink]="langs.link('/services')"
            class="inline-flex h-12 items-center rounded-full border border-sand/50 px-6 text-sand"
            >{{ 'notFound.services' | transloco }}</a
          >
        </div>
      </div>
      <div class="crown-row opacity-80" aria-hidden="true"></div>
    </section>
  `,
})
export class NotFoundPage {
  protected readonly langs = inject(LangService);

  constructor() {
    const response = inject(RESPONSE_INIT, { optional: true });
    if (response) response.status = 404;

    const seo = inject(SeoService);
    effect(() => {
      this.langs.lang();
      seo.set({
        title: this.langs.t('seo.notFound.title'),
        description: this.langs.t('seo.notFound.description'),
        path: '/404',
        noindex: true,
      });
    });
  }
}
