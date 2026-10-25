import type { L10n, Lang } from './i18n/lang';

export type { L10n, Lang };
export type Currency = 'GEL' | 'USD';

export type PriceVariantKey = 'standard' | 'sedan' | 'crossover' | 'suv' | 'defender_gclass';

export interface PriceVariant {
  key: PriceVariantKey;
  from: number;
  withArchesFrom?: number;
}

export interface Price {
  from: number;
  currency: Currency;
  variants?: PriceVariant[];
  note?: L10n;
  todo?: string;
}

export type ServiceCategory = 'protection' | 'body' | 'interior' | 'sound' | 'wheels';

export interface Service {
  slug: string;
  category: ServiceCategory;
  flagship?: boolean;
  name: L10n;
  short: L10n;
  description: L10n;
  includes: L10n[];
  duration: L10n;
  price: Price;
  warranty?: L10n;
  materialIds?: string[];
  image: string;
  order: number;
  bundleWith?: string[];
  todo?: string[];
}

export interface Review {
  id: string;
  author: string;
  car?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  lang?: Lang;
  source: 'google' | 'yandex';
  url?: string;
  date?: string;
  demo?: boolean;
  todo?: string;
}

export interface Work {
  id: string;
  car: string;
  serviceSlugs: string[];
  /** Media ids from assets/media/manifest.json. */
  cover: string;
  gallery: string[];
  /** Before/after pair: shown as a slider only when both are set and match in framing. */
  before?: string;
  after?: string;
  description?: L10n;
  duration?: L10n;
  demo?: boolean;
  todo?: string;
}

/** Real studio footage, built by tools/optimize-video.py into public/media/video/<id>.mp4 + <id>-poster.webp. */
export interface Video {
  id: string;
  source: string;
  serviceSlugs: string[];
  title: L10n;
  width: number;
  height: number;
  duration: number;
  sizeKb?: number;
  todo?: string;
}

export type FaqGroup = 'general' | 'ppf' | 'polishing' | 'interior' | 'sound' | 'warranty';

export interface Faq {
  id: string;
  group: FaqGroup;
  q: L10n;
  a: L10n;
  serviceSlugs?: string[];
  demo?: boolean;
}

export interface TeamMember {
  id: string;
  name: L10n;
  role: L10n;
  photo: string;
  bio?: L10n;
  demo?: boolean;
}

/** Text block for articles and legal pages: paragraph, subheading or bullet list. */
export type RichBlock = { p: string } | { h2: string } | { ul: string[] };
export type RichText = Record<Lang, RichBlock[]>;

export interface Article {
  slug: string;
  title: L10n;
  excerpt: L10n;
  /** Media id from assets/media/manifest.json. */
  cover: string;
  date: string;
  readMinutes: number;
  serviceSlugs?: string[];
  demo?: boolean;
}

export interface LegalPage {
  updated: string;
  /** Document the text was imported from, if provided by the client. */
  source?: string;
  body: RichText;
  todo?: string;
}

export interface Bundle {
  id: string;
  name: L10n;
  description: L10n;
  services: string[];
  todo?: string;
}

export interface RatingSummary {
  source: Review['source'];
  value: number | null;
  count: number | null;
  url: string;
}

export interface Material {
  id: string;
  brand: string;
  product?: string;
  description?: L10n;
  todo?: string;
}

export interface Lead {
  name: string;
  phone: string;
  service?: string;
  car?: string;
  comment?: string;
  source: string;
  lang: Lang;
  utm?: Record<string, string>;
  consent: true;
}

export interface OpeningHours {
  /** ISO weekday 1 (Mon) – 7 (Sun). */
  day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  open: string;
  close: string;
}

export interface SiteConfig {
  siteUrl: string;
  name: string;
  legalName?: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string | null;
  instagram: string | null;
  telegram: string | null;
  email: string | null;
  address: L10n;
  postalAddress: { street: string; locality: string; postalCode: string; country: string };
  geo: { lat: number; lng: number };
  maps: { google: string; yandex: string; embed: string; yandexWidget: string };
  hours: { timezone: string; schedule: OpeningHours[]; todo?: string };
  responseTimeMinutes: number;
  rating: {
    google: { value: number; count: number; url: string; updated: string };
    yandex: { value: number | null; count: number | null; url: string; updated: string | null };
  };
  warranty: { filmYears: { min: number; max: number }; ppfWorkYears: number; todo?: string };
  analytics: { ga4: string; metaPixel: string; gtm: string };
  features: {
    leadForm: boolean;
    telegram: boolean;
    cursorRing: boolean;
    smoothScroll: boolean;
  };
}
