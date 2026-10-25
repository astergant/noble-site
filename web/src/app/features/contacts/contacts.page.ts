import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { SITE } from '../../core/config/site.config';
import { LangService } from '../../core/i18n/lang.service';
import { breadcrumbLd, localBusinessLd } from '../../core/seo/json-ld';
import { SeoService } from '../../core/seo/seo.service';
import { ContactButtons } from '../../shared/ui/contact-buttons/contact-buttons';
import { ContactDetails } from '../../shared/ui/contact-details/contact-details';
import { PageHero } from '../../shared/ui/page-hero/page-hero';

@Component({
  selector: 'app-contacts-page',
  imports: [TranslocoPipe, PageHero, ContactButtons, ContactDetails],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      [title]="'pages.contacts.title' | transloco"
      [eyebrow]="'pages.contacts.eyebrow' | transloco"
      [lead]="'common.responseTime' | transloco: { minutes: site.responseTimeMinutes }"
      [crumbs]="[{ label: 'nav.contacts' | transloco }]"
    >
      <app-contact-buttons class="mt-8" placement="contacts_hero" />
    </app-page-hero>

    <section class="container-page py-section" aria-labelledby="contacts-title">
      <h2 id="contacts-title" class="sr-only">{{ 'pages.contacts.title' | transloco }}</h2>
      <app-contact-details placement="contacts_page" />
    </section>
  `,
})
export class ContactsPage {
  protected readonly site = inject(SITE);
  private readonly langs = inject(LangService);
  private readonly seo = inject(SeoService);

  constructor() {
    effect(() => {
      const lang = this.langs.lang();
      this.seo.set({
        title: this.langs.t('seo.contacts.title'),
        description: this.langs.t('seo.contacts.description'),
        path: '/contacts',
        jsonLd: [
          localBusinessLd(this.site, lang),
          breadcrumbLd([
            { name: this.langs.t('breadcrumbs.home'), url: this.seo.url('/') },
            { name: this.langs.t('nav.contacts'), url: this.seo.url('/contacts') },
          ]),
        ],
      });
    });
  }
}
