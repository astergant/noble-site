import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import type { Config } from '../config.js';
import { logger } from '../logger.js';
import { sheetsEnabled } from '../providers/sheets.js';
import type { LeadRepository, NotificationProvider } from '../providers/types.js';
import { LeadSchema } from '../schemas.js';
import { verifyTurnstile } from '../services/turnstile.js';

export interface LeadRouteDeps {
  config: Config;
  repository: LeadRepository;
  notifiers: NotificationProvider[];
}

export function leadRouter({ config, repository, notifiers }: LeadRouteDeps): Router {
  const router = Router();

  const limiter = rateLimit({
    windowMs: config.LEAD_RATE_WINDOW_MIN * 60_000,
    limit: config.LEAD_RATE_LIMIT,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { ok: false, error: 'rate_limited' },
  });

  router.post('/lead', limiter, async (req, res) => {
    const parsed = LeadSchema.safeParse(req.body);
    if (!parsed.success) {
      const fields = [...new Set(parsed.error.issues.map((i) => String(i.path[0] ?? 'body')))];
      res.status(400).json({ ok: false, error: 'validation', fields });
      return;
    }

    const { noble_hp, turnstileToken, ...lead } = parsed.data;

    // Honeypot filled: pretend success so bots do not learn anything.
    if (noble_hp) {
      logger.warn('lead.honeypot');
      res.json({ ok: true });
      return;
    }

    if (config.TURNSTILE_SECRET && !(await verifyTurnstile(config.TURNSTILE_SECRET, turnstileToken, req.ip))) {
      res.status(400).json({ ok: false, error: 'captcha' });
      return;
    }

    if (!sheetsEnabled(config)) {
      logger.error('lead.sheets_missing', undefined, { reason: 'Set GOOGLE_SHEET_ID, GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in api/.env' });
      res.status(503).json({ ok: false, error: 'delivery' });
      return;
    }

    let stored;
    try {
      stored = await repository.save(lead);
    } catch (err) {
      logger.error('lead.save_failed', err);
      res.status(502).json({ ok: false, error: 'delivery' });
      return;
    }
    const active = notifiers.filter((n) => n.enabled);
    const results = await Promise.allSettled(active.map((n) => n.notify(stored)));
    const delivered = results.filter((r) => r.status === 'fulfilled').length;

    results.forEach((r, i) => {
      if (r.status === 'rejected') logger.error('lead.notify_failed', r.reason, { provider: active[i]!.name, id: stored.id });
    });
    logger.info('lead.received', { id: stored.id, source: stored.source, lang: stored.lang, delivered });

    if (active.length > 0 && delivered === 0) {
      res.status(502).json({ ok: false, error: 'delivery' });
      return;
    }
    res.json({ ok: true });
  });

  return router;
}
