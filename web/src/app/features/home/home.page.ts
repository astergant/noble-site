import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { ContactService } from '../../core/config/contact.service';
import { SITE } from '../../core/config/site.config';
import { ContentService, SERVICE_CATEGORIES } from '../../core/data/content.service';
import { formatRating } from '../../core/i18n/format';
import { LangService } from '../../core/i18n/lang.service';
import type { Service } from '../../core/models';
import { ReviewsService } from '../../core/reviews/reviews';
import { localBusinessLd } from '../../core/seo/json-ld';
import { SeoService } from '../../core/seo/seo.service';
import { ContactCta } from '../../shared/ui/contact-cta/contact-cta';
import { ContactDetails } from '../../shared/ui/contact-details/contact-details';
import { Icon } from '../../shared/ui/icon/icon';
import { MediaFrame } from '../../shared/ui/media-frame/media-frame';
import { Reveal } from '../../shared/ui/reveal.directive';
import { RatingSummary } from '../../shared/ui/rating-summary/rating-summary';
import { ReviewsCarousel } from '../../shared/ui/reviews-carousel/reviews-carousel';
import { SectionHeading } from '../../shared/ui/section-heading/section-heading';
import { ServiceCard } from '../../shared/ui/service-card/service-card';
import { StatusChip } from '../../shared/ui/status-chip/status-chip';
import { LeadForm } from '../../shared/ui/lead-form/lead-form';
import { WorksGrid } from '../../shared/ui/works-grid/works-grid';

const POPULAR = ['polishing', 'interior-cleaning', 'soundproofing-full', 'wheel-painting'];

@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    Icon,
    StatusChip,
    MediaFrame,
    SectionHeading,
    ServiceCard,
    LeadForm,
    WorksGrid,
    RatingSummary,
    ReviewsCarousel,
    ContactDetails,
    ContactCta,
    Reveal,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.page.html',
})
export class HomePage {
  protected readonly langs = inject(LangService);
  protected readonly contact = inject(ContactService);
  protected readonly site = inject(SITE);
  protected readonly categories = SERVICE_CATEGORIES.filter((c) => c !== 'wheels');

  private readonly content = inject(ContentService);
  protected readonly flagship = this.content.services.filter((s) => s.flagship);
  protected readonly popular = POPULAR.map((slug) => this.content.service(slug)).filter((s): s is Service => !!s);
  protected readonly works = this.content.works.slice(0, 4);
  protected readonly reviews = inject(ReviewsService).all;

  private readonly seo = inject(SeoService);

  protected get rating(): string {
    return formatRating(this.site.rating.google.value, this.langs.lang());
  }

  constructor() {
    effect(() => {
      const lang = this.langs.lang();
      this.seo.set({
        title: this.langs.t('seo.home.title'),
        description: this.langs.t('seo.home.description'),
        path: '/',
        jsonLd: [localBusinessLd(this.site, lang)],
      });
    });
  }
}
