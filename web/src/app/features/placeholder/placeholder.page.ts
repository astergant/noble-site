import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { map } from 'rxjs';
import { LangService } from '../../core/i18n/lang.service';
import { SeoService } from '../../core/seo/seo.service';
import { PageHero } from '../../shared/ui/page-hero/page-hero';

/**
 * Temporary page for sections built in later stages. Route data:
 * `page` — key in `pages.*` and `seo.*` translations, `path` — URL without language.
 */
@Component({
  selector: 'app-placeholder-page',
  imports: [PageHero, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      [title]="t('title')"
      [eyebrow]="t('eyebrow')"
      [lead]="t('lead')"
      [crumbs]="[{ label: t('title') }]"
    />
    <section class="container-page py-section">
      <p class="demo-flag max-w-xl rounded-card border border-dashed border-line bg-mist p-8 text-muted">
        {{ 'common.placeholder' | transloco }}
      </p>
    </section>
  `,
})
export class PlaceholderPage {
  private readonly langs = inject(LangService);
  private readonly seo = inject(SeoService);
  private readonly data = toSignal(inject(ActivatedRoute).data.pipe(map((d) => d as { page: string; path: string })), {
    requireSync: true,
  });

  protected readonly page = computed(() => this.data().page);

  protected t(field: string): string {
    this.langs.lang();
    return this.langs.t(`pages.${this.page()}.${field}`);
  }

  constructor() {
    effect(() => {
      this.langs.lang();
      const { page, path } = this.data();
      this.seo.set({ title: this.langs.t(`seo.${page}.title`), description: this.langs.t(`seo.${page}.description`), path });
    });
  }
}
