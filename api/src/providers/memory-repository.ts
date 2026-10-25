import { randomUUID } from 'node:crypto';
import type { Lead } from '../schemas.js';
import type { LeadRepository, StoredLead } from './types.js';

/** Assigns an id and timestamp without persisting anything (no personal data kept on the server). */
export class NoopLeadRepository implements LeadRepository {
  async save(lead: Lead): Promise<StoredLead> {
    return { ...lead, id: randomUUID(), createdAt: new Date().toISOString() };
  }
}
