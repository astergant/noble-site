import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { SITE } from '../../core/config/site.config';
import { ContentService } from '../../core/data/content.service';
import { LangService } from '../../core/i18n/lang.service';
import { breadcrumbLd, faqLd } from '../../core/seo/json-ld';
import { SeoService } from '../../core/seo/seo.service';
import { ContactButtons } from '../../shared/ui/contact-buttons/contact-buttons';
import { ContactCta } from '../../shared/ui/contact-cta/contact-cta';
import { FaqList } from '../../shared/ui/faq-list/faq-list';
import { PageHero } from '../../shared/ui/page-hero/page-hero';

@Component({
  selector: 'app-faq-page',
  imports: [TranslocoPipe, PageHero, FaqList, ContactButtons, ContactCta],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      [title]="'pages.faq.title' | transloco"
      [eyebrow]="'pages.faq.eyebrow' | transloco"
      [lead]="'pages.faq.lead' | transloco"
      [crumbs]="[{ label: 'pages.faq.title' | transloco }]"
    />

    <div class="container-page grid gap-12 py-section lg:grid-cols-[14rem_1fr] lg:gap-16">
      <nav class="lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:self-start" [attr.aria-label]="'faq.topics' | transloco">
        <ul class="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
          @for (g of groups; track g.group) {
            <li>
              <a
                [href]="langs.link('/faq') + '#faq-' + g.group"
                (click)="go($event, g.group)"
                class="inline-block rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-night/40 lg:rounded-control lg:border-transparent lg:px-3"
              >
                {{ 'faq.groups.' + g.group | transloco }}
              </a>
            </li>
          }
        </ul>
      </nav>

      <div class="min-w-0">
        @for (g of groups; track g.group) {
          <section class="scroll-mt-28 [&:not(:first-child)]:mt-14" [id]="'faq-' + g.group" [attr.aria-labelledby]="'faq-' + g.group + '-title'">
            <h2 [id]="'faq-' + g.group + '-title'" class="text-h3 text-night-950">{{ 'faq.groups.' + g.group | transloco }}</h2>
            <app-faq-list class="mt-5" [items]="g.items" />
          </section>
        }

        <div class="mt-16 rounded-card bg-mist p-6 md:p-8">
          <h2 class="text-h4 text-night-950">{{ 'faq.askTitle' | transloco }}</h2>
          <p class="mt-2 text-muted">{{ 'faq.askText' | transloco: { minutes: site.responseTimeMinutes } }}</p>
          <app-contact-buttons class="mt-6" placement="faq_ask" [dark]="false" />
        </div>
      </div>
    </div>

    <app-contact-cta placement="faq_cta" />
  `,
})
export class FaqPage {
  protected readonly langs = inject(LangService);
  protected readonly site = inject(SITE);
  private readonly doc = inject(DOCUMENT);
  private readonly content = inject(ContentService);
  private readonly seo = inject(SeoService);
  protected readonly groups = this.content.faqByGroup();

  /** In-page jump without the router (which would re-resolve the lazy route). Runs only on click, i.e. in the browser. */
  protected go(e: Event, group: string): void {
    const el = this.doc.getElementById('faq-' + group);
    if (!el) return;
    e.preventDefault();
    const win = this.doc.defaultView!;
    const reduce = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    win.history.replaceState(win.history.state, '', '#faq-' + group);
  }

  constructor() {
    effect(() => {
      const lang = this.langs.lang();
      this.seo.set({
        title: this.langs.t('seo.faq.title'),
        description: this.langs.t('seo.faq.description'),
        path: '/faq',
        jsonLd: [
          faqLd(this.content.faq, lang),
          breadcrumbLd([
            { name: this.langs.t('breadcrumbs.home'), url: this.seo.url('/') },
            { name: this.langs.t('pages.faq.title'), url: this.seo.url('/faq') },
          ]),
        ],
      });
    });
  }
}
