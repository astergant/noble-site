import type { Lead } from '../schemas.js';

export interface StoredLead extends Lead {
  id: string;
  createdAt: string;
}

/** Delivers a new lead to people (Telegram chat, e-mail, later WhatsApp bot / CRM). */
export interface NotificationProvider {
  readonly name: string;
  readonly enabled: boolean;
  notify(lead: StoredLead): Promise<void>;
}

/** Persistence layer. Today a no-op; PostgreSQL implementation plugs in here. */
export interface LeadRepository {
  save(lead: Lead): Promise<StoredLead>;
}

/** Future online booking with slots. Not implemented: the site only collects requests. */
export interface BookingProvider {
  getAvailableSlots(serviceSlug: string, date: string): Promise<string[]>;
  reserve(leadId: string, slot: string): Promise<{ confirmed: boolean }>;
}

/** Future online payments (deposit). Not implemented. */
export interface PaymentProvider {
  createPayment(leadId: string, amount: number, currency: 'GEL' | 'USD'): Promise<{ url: string }>;
}
