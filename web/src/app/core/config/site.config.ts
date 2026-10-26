import { InjectionToken } from '@angular/core';
import type { SiteConfig } from '../models';
import site from '../../data/site.json';

export const SITE = new InjectionToken<SiteConfig>('SITE', {
  providedIn: 'root',
  factory: () => site as SiteConfig,
});

export function telHref(c: SiteConfig): string {
  return `tel:${c.phone}`;
}

export function whatsappHref(c: SiteConfig, text?: string): string | null {
  if (!c.whatsapp) return null;
  return `https://wa.me/${c.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export function instagramHref(c: SiteConfig): string | null {
  return c.instagram ? `https://www.instagram.com/${c.instagram}/` : null;
}

export function telegramHref(c: SiteConfig): string | null {
  if (!c.telegram) return null;
  return `https://t.me/${c.telegram.replace(/^@/, '')}`;
}
