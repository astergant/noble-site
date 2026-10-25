import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { ContentService } from '../../core/data/content.service';
import { LangService } from '../../core/i18n/lang.service';
import { breadcrumbLd } from '../../core/seo/json-ld';
import { SeoService } from '../../core/seo/seo.service';
import { ContactCta } from '../../shared/ui/contact-cta/contact-cta';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHero } from '../../shared/ui/page-hero/page-hero';
import { Reveal } from '../../shared/ui/reveal.directive';
import { SectionHeading } from '../../shared/ui/section-heading/section-heading';
import { ServiceCard } from '../../shared/ui/service-card/service-card';

@Component({
  selector: 'app-services-page',
  imports: [RouterLink, TranslocoPipe, PageHero, ServiceCard, SectionHeading, ContactCta, Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      [title]="'pages.services.title' | transloco"
      [eyebrow]="'pages.services.eyebrow' | transloco"
      [lead]="'pages.services.lead' | transloco"
      [crumbs]="[{ label: 'nav.services' | transloco }]"
    >
      <nav class="mt-10 flex flex-wrap gap-2" [attr.aria-label]="'services.categoriesAria' | transloco">
        @for (g of groups; track g.category) {
          <a
            [routerLink]="[]"
            [fragment]="g.category"
            class="rounded-full border border-white/20 px-4 py-2 text-sm text-white/85 transition-colors hover:border-sand hover:text-sand"
          >
            {{ 'categories.' + g.category | transloco }}
          </a>
        }
      </nav>
    </app-page-hero>

    @for (g of groups; track g.category; let first = $first) {
      <section [id]="g.category" class="py-section" [class.bg-mist]="!first && $index % 2 === 0" [attr.aria-labelledby]="'cat-' + g.category">
        <div class="container-page">
          <app-section-heading
            [headingId]="'cat-' + g.category"
            [eyebrow]="'0' + ($index + 1)"
            [title]="'categories.' + g.category | transloco"
            [lead]="'services.categoryLead.' + g.category | transloco"
          />
          <ul class="mt-10 grid gap-6 md:grid-cols-2" [class]="first ? '' : 'lg:grid-cols-3'">
            @for (s of g.services; track s.slug; let i = $index) {
              <li [appReveal]="i * 80">
                <app-service-card [service]="s" [featured]="!!s.flagship" />
              </li>
            }
          </ul>
        </div>
      </section>
    }

    @if (content.bundles.length) {
      <section class="border-t border-line py-section" aria-labelledby="bundles-title">
        <div class="container-page">
          <app-section-heading headingId="bundles-title" [title]="'services.bundlesTitle' | transloco" [lead]="'services.bundlesLead' | transloco" />
          <ul class="mt-10 grid gap-6 md:grid-cols-3">
            @for (b of content.bundles; track b.id; let i = $index) {
              <li class="flex flex-col rounded-card border border-line p-6 md:p-8" [appReveal]="i * 80">
                <app-icon name="layers" [size]="24" class="text-sand-700" />
                <h3 class="mt-4 text-h4 text-night-950">{{ langs.pick(b.name) }}</h3>
                <p class="mt-2 text-[0.9375rem] text-muted">{{ langs.pick(b.description) }}</p>
                <ul class="mt-5 flex-1 space-y-2 border-t border-line pt-5 text-[0.9375rem]">
                  @for (slug of b.services; track slug) {
                    @if (content.service(slug); as s) {
                      <li>
                        <a [routerLink]="langs.link('/services/' + slug)" class="flex items-center gap-2 text-night hover:underline">
                          <app-icon name="check" [size]="16" class="shrink-0 text-sand-700" /> {{ langs.pick(s.name) }}
                        </a>
                      </li>
                    }
                  }
                </ul>
                <p class="mt-5 text-sm text-subtle">{{ 'services.bundlePrice' | transloco }}</p>
              </li>
            }
          </ul>
        </div>
      </section>
    }

    <app-contact-cta placement="services_cta" title="services.notFoundTitle" />
  `,
})
export class ServicesPage {
  protected readonly langs = inject(LangService);
  protected readonly content = inject(ContentService);
  private readonly seo = inject(SeoService);
  protected readonly groups = this.content.categories();

  constructor() {
    effect(() => {
      this.langs.lang();
      this.seo.set({
        title: this.langs.t('seo.services.title'),
        description: this.langs.t('seo.services.description'),
        path: '/services',
        jsonLd: [
          breadcrumbLd([
            { name: this.langs.t('breadcrumbs.home'), url: this.seo.url('/') },
            { name: this.langs.t('nav.services'), url: this.seo.url('/services') },
          ]),
        ],
      });
    });
  }
}
