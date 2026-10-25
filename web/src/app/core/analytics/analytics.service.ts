import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, Injectable, PLATFORM_ID, effect, inject } from '@angular/core';
import { SITE } from '../config/site.config';
import { ConsentService } from './consent.service';

export type AnalyticsEvent =
  | 'click_call'
  | 'click_whatsapp'
  | 'click_instagram'
  | 'click_telegram'
  | 'view_service'
  | 'lead_submit_success'
  | 'lead_submit_error'
  | 'language_switch'
  | 'gallery_open';

type Params = Record<string, string | number | boolean | undefined>;

interface AnalyticsWindow extends Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string; callMethod?: unknown };
  _fbq?: unknown;
}

const UTM_KEY = 'noble.utm';
const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly doc = inject(DOCUMENT);
  private readonly site = inject(SITE);
  private readonly consent = inject(ConsentService);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private loaded = false;

  constructor() {
    if (!this.browser) return;
    this.captureUtm();
    effect(() => {
      if (this.consent.state() === 'granted') this.load();
    });
  }

  track(event: AnalyticsEvent, params: Params = {}): void {
    if (!this.browser || this.consent.state() !== 'granted') return;
    const w = this.doc.defaultView as AnalyticsWindow;
    w.dataLayer?.push({ event, ...params });
    w.gtag?.('event', event, params);
    w.fbq?.('trackCustom', event, params);
  }

  /** UTM tags of the current session, passed along with leads. */
  utm(): Record<string, string> | undefined {
    if (!this.browser) return undefined;
    try {
      const raw = sessionStorage.getItem(UTM_KEY);
      return raw ? (JSON.parse(raw) as Record<string, string>) : undefined;
    } catch {
      return undefined;
    }
  }

  private captureUtm(): void {
    try {
      const params = new URLSearchParams(this.doc.location.search);
      const utm = Object.fromEntries(UTM_FIELDS.filter((k) => params.has(k)).map((k) => [k, params.get(k)!.slice(0, 200)]));
      if (Object.keys(utm).length) sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
    } catch {
      /* ignore */
    }
  }

  private load(): void {
    if (this.loaded) return;
    this.loaded = true;
    const w = this.doc.defaultView as AnalyticsWindow;
    const { ga4, gtm, metaPixel } = this.site.analytics;
    w.dataLayer = w.dataLayer ?? [];

    if (gtm) {
      w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      this.script(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtm)}`);
    }
    if (ga4) {
      w.gtag = function gtag() {
        // gtag requires the `arguments` object, not an array.
        // eslint-disable-next-line prefer-rest-params
        w.dataLayer!.push(arguments);
      };
      w.gtag('js', new Date());
      w.gtag('config', ga4, { anonymize_ip: true });
      this.script(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4)}`);
    }
    if (metaPixel) {
      const fbq = function (...args: unknown[]) {
        const self = fbq as AnalyticsWindow['fbq'] & {};
        if (typeof self.callMethod === 'function') (self.callMethod as (...a: unknown[]) => void)(...args);
        else self.queue!.push(args);
      } as NonNullable<AnalyticsWindow['fbq']>;
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = '2.0';
      w.fbq = fbq;
      w._fbq = fbq;
      this.script('https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', metaPixel);
      fbq('track', 'PageView');
    }
  }

  private script(src: string): void {
    const s = this.doc.createElement('script');
    s.async = true;
    s.src = src;
    this.doc.head.appendChild(s);
  }
}
