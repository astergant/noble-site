import type { Article, Faq, Lang, Service, SiteConfig } from '../models';

const DAY = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export function localBusinessLd(site: SiteConfig, lang: Lang): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoBodyShop',
    '@id': `${site.siteUrl}/#business`,
    name: site.name,
    url: `${site.siteUrl}/${lang}/`,
    image: `${site.siteUrl}/brand/icon-512.png`,
    logo: `${site.siteUrl}/brand/icon-512.png`,
    telephone: site.phone,
    ...(site.email ? { email: site.email } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.postalAddress.street,
      addressLocality: site.postalAddress.locality,
      postalCode: site.postalAddress.postalCode,
      addressCountry: site.postalAddress.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.maps.google,
    openingHoursSpecification: site.hours.schedule.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${DAY[h.day]}`,
      opens: h.open,
      closes: h.close,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: site.rating.google.value,
      reviewCount: site.rating.google.count,
      bestRating: 5,
    },
    sameAs: [site.instagram ? `https://www.instagram.com/${site.instagram}/` : null, site.maps.google].filter(Boolean),
  };
}

export function serviceLd(site: SiteConfig, service: Service, lang: Lang, url: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name[lang],
    description: service.short[lang],
    url,
    areaServed: { '@type': 'City', name: 'Tbilisi' },
    provider: { '@id': `${site.siteUrl}/#business` },
    offers: {
      '@type': 'Offer',
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: service.price.from,
        priceCurrency: service.price.currency,
      },
    },
  };
}

export function faqLd(items: Faq[], lang: Lang): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q[lang],
      acceptedAnswer: { '@type': 'Answer', text: f.a[lang] },
    })),
  };
}

export function articleLd(site: SiteConfig, article: Article, lang: Lang, url: string, image: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title[lang],
    description: article.excerpt[lang],
    inLanguage: lang,
    datePublished: article.date,
    image,
    url,
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: site.name, url: site.siteUrl },
    publisher: { '@id': `${site.siteUrl}/#business` },
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}
