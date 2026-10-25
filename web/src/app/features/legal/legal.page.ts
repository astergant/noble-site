import { ChangeDetectionStrategy, Component, computed, effect, inject, isDevMode } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { map } from 'rxjs';
import { formatDate } from '../../core/i18n/format';
import { LangService } from '../../core/i18n/lang.service';
import type { LegalPage as LegalData } from '../../core/models';
import { breadcrumbLd } from '../../core/seo/json-ld';
import { SeoService } from '../../core/seo/seo.service';
import { PageHero } from '../../shared/ui/page-hero/page-hero';
import { RichText } from '../../shared/ui/rich-text/rich-text';
import legal from '../../data/legal.json';

type LegalKey = 'privacy' | 'terms';
const LEGAL = legal as Record<LegalKey, LegalData>;

/** Privacy policy and warranty terms. Texts live in data/legal.json and await legal review (see `todo`). */
@Component({
  selector: 'app-legal-page',
  imports: [TranslocoPipe, PageHero, RichText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      [title]="'pages.' + key() + '.title' | transloco"
      [eyebrow]="'pages.' + key() + '.eyebrow' | transloco"
      [lead]="'pages.' + key() + '.lead' | transloco"
      [crumbs]="[{ label: 'pages.' + key() + '.title' | transloco }]"
    />
    <section class="container-page py-section">
      <div [class.demo-flag]="dev && !!data().todo">
        <app-rich-text [blocks]="data().body[langs.lang()]" />
      </div>
      <p class="mt-12 text-sm text-subtle">{{ 'legal.updated' | transloco: { date: updated() } }}</p>
    </section>
  `,
})
export class LegalPage {
  protected readonly langs = inject(LangService);
  private readonly seo = inject(SeoService);
  protected readonly dev = isDevMode();

  protected readonly key = toSignal(inject(ActivatedRoute).data.pipe(map((d) => d['legal'] as LegalKey)), {
    requireSync: true,
  });
  protected readonly data = computed(() => LEGAL[this.key()]);
  protected readonly updated = computed(() => formatDate(this.data().updated, this.langs.lang()));

  constructor() {
    effect(() => {
      this.langs.lang();
      const key = this.key();
      this.seo.set({
        title: this.langs.t(`seo.${key}.title`),
        description: this.langs.t(`seo.${key}.description`),
        path: `/${key}`,
        jsonLd: [
          breadcrumbLd([
            { name: this.langs.t('breadcrumbs.home'), url: this.seo.url('/') },
            { name: this.langs.t(`pages.${key}.title`), url: this.seo.url(`/${key}`) },
          ]),
        ],
      });
    });
  }
}
