import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ContentService } from '../../core/data/content.service';
import { LangService } from '../../core/i18n/lang.service';
import { breadcrumbLd } from '../../core/seo/json-ld';
import { SeoService } from '../../core/seo/seo.service';
import { ArticleCard } from '../../shared/ui/article-card/article-card';
import { ContactCta } from '../../shared/ui/contact-cta/contact-cta';
import { PageHero } from '../../shared/ui/page-hero/page-hero';
import { Reveal } from '../../shared/ui/reveal.directive';

@Component({
  selector: 'app-journal-page',
  imports: [TranslocoPipe, PageHero, ArticleCard, ContactCta, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      [title]="'pages.journal.title' | transloco"
      [eyebrow]="'pages.journal.eyebrow' | transloco"
      [lead]="'pages.journal.lead' | transloco"
      [crumbs]="[{ label: 'nav.journal' | transloco }]"
    />

    <section class="container-page py-section" aria-labelledby="journal-list-title">
      <h2 id="journal-list-title" class="sr-only">{{ 'pages.journal.title' | transloco }}</h2>
      @if (first; as a) {
        <app-article-card [article]="a" [featured]="true" />
      }
      <ul class="mt-16 grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-4">
        @for (a of rest; track a.slug; let i = $index) {
          <li [appReveal]="(i % 4) * 80"><app-article-card [article]="a" /></li>
        }
      </ul>
    </section>

    <app-contact-cta placement="journal_cta" />
  `,
})
export class JournalPage {
  private readonly langs = inject(LangService);
  private readonly seo = inject(SeoService);
  private readonly articles = inject(ContentService).articles;
  protected readonly first = this.articles[0];
  protected readonly rest = this.articles.slice(1);

  constructor() {
    effect(() => {
      this.langs.lang();
      this.seo.set({
        title: this.langs.t('seo.journal.title'),
        description: this.langs.t('seo.journal.description'),
        path: '/journal',
        jsonLd: [
          breadcrumbLd([
            { name: this.langs.t('breadcrumbs.home'), url: this.seo.url('/') },
            { name: this.langs.t('nav.journal'), url: this.seo.url('/journal') },
          ]),
        ],
      });
    });
  }
}
