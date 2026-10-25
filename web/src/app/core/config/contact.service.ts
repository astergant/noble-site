import { Injectable, inject } from '@angular/core';
import { AnalyticsService } from '../analytics/analytics.service';
import { SITE, instagramHref, telHref, telegramHref, whatsappHref } from './site.config';

export type ContactChannel = 'call' | 'whatsapp' | 'instagram' | 'telegram';

/** Contact links (from site.json) plus click tracking, shared by every CTA on the site. */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly analytics = inject(AnalyticsService);
  readonly site = inject(SITE);

  readonly tel = telHref(this.site);
  readonly whatsapp = whatsappHref(this.site);
  readonly instagram = instagramHref(this.site);
  readonly telegram = telegramHref(this.site);

  track(channel: ContactChannel, placement: string): void {
    this.analytics.track(`click_${channel}`, { placement });
  }
}
