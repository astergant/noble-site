import { Injectable } from '@angular/core';
import type { Article, Bundle, Faq, FaqGroup, Lang, RichText, Service, ServiceCategory, Video, Work } from '../models';
import videos from '../../data/videos.json';
import services from '../../data/services.json';
import works from '../../data/works.json';
import journal from '../../data/journal.json';
import bundles from '../../data/bundles.json';
import faq from '../../data/faq.json';

export const SERVICE_CATEGORIES: readonly ServiceCategory[] = ['protection', 'body', 'interior', 'sound', 'wheels'];
export const FAQ_GROUPS: readonly FaqGroup[] = ['general', 'ppf', 'polishing', 'interior', 'sound', 'warranty'];

const SERVICES = (services as Service[]).slice().sort((a, b) => a.order - b.order);
const WORKS = works as Work[];
const ARTICLES = (journal as Article[]).slice().sort((a, b) => b.date.localeCompare(a.date));
const BUNDLES = bundles as Bundle[];
const FAQ = faq as Faq[];
const VIDEOS = (videos as Video[]).filter((v) => v.width && v.height);

/** Article bodies are split into their own chunks so the journal list and other pages don't load them. */
const ARTICLE_BODIES: Record<string, () => Promise<{ default: unknown }>> = {
  'ppf-care': () => import('../../data/articles/ppf-care.json'),
  'safe-car-wash': () => import('../../data/articles/safe-car-wash.json'),
  'leather-interior-care': () => import('../../data/articles/leather-interior-care.json'),
  'fabric-interior-care': () => import('../../data/articles/fabric-interior-care.json'),
  'polishing-basics': () => import('../../data/articles/polishing-basics.json'),
};

/** Static content bundled at build time. Pages read data only through this service. */
@Injectable({ providedIn: 'root' })
export class ContentService {
  readonly services = SERVICES;
  readonly works = WORKS;
  readonly articles = ARTICLES;
  readonly bundles = BUNDLES;
  readonly faq = FAQ;
  readonly videos = VIDEOS;

  service(slug: string | null | undefined): Service | undefined {
    return SERVICES.find((s) => s.slug === slug);
  }

  servicesByCategory(category: ServiceCategory): Service[] {
    return SERVICES.filter((s) => s.category === category);
  }

  /** Categories that have at least one service, in display order. */
  categories(): { category: ServiceCategory; services: Service[] }[] {
    return SERVICE_CATEGORIES.map((category) => ({ category, services: this.servicesByCategory(category) })).filter(
      (g) => g.services.length > 0,
    );
  }

  related(service: Service): Service[] {
    return (service.bundleWith ?? []).map((slug) => this.service(slug)).filter((s): s is Service => !!s);
  }

  worksForService(slug: string): Work[] {
    return WORKS.filter((w) => w.serviceSlugs.includes(slug));
  }

  videosForService(slug: string): Video[] {
    return VIDEOS.filter((v) => v.serviceSlugs.includes(slug));
  }

  /** Service names of a work joined with a middle dot, e.g. "Полировка · Химчистка". */
  serviceNames(work: Work, lang: Lang): string {
    return work.serviceSlugs
      .map((slug) => this.service(slug)?.name[lang])
      .filter(Boolean)
      .join(' · ');
  }

  article(slug: string | null | undefined): Article | undefined {
    return ARTICLES.find((a) => a.slug === slug);
  }

  articlesForService(slug: string): Article[] {
    return ARTICLES.filter((a) => a.serviceSlugs?.includes(slug));
  }

  async articleBody(slug: string): Promise<RichText | null> {
    const load = ARTICLE_BODIES[slug];
    return load ? ((await load()).default as RichText) : null;
  }

  faqByGroup(): { group: FaqGroup; items: Faq[] }[] {
    return FAQ_GROUPS.map((group) => ({ group, items: FAQ.filter((f) => f.group === group) })).filter(
      (g) => g.items.length > 0,
    );
  }

  faqForService(slug: string): Faq[] {
    return FAQ.filter((f) => f.serviceSlugs?.includes(slug));
  }
}

/** Used by app.routes.server.ts to enumerate prerender params. */
export const CONTENT_SLUGS = {
  services: SERVICES.map((s) => s.slug),
  journal: ARTICLES.map((a) => a.slug),
};
