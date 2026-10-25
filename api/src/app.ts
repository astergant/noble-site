import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import type { Config } from './config.js';
import { logger } from './logger.js';
import { MailNotifier } from './providers/mail.js';
import { SheetsLeadRepository, sheetsEnabled } from './providers/sheets.js';
import { TelegramNotifier } from './providers/telegram.js';
import type { LeadRepository, NotificationProvider } from './providers/types.js';
import { leadRouter } from './routes/lead.js';

export interface AppDeps {
  repository?: LeadRepository;
  notifiers?: NotificationProvider[];
}

export function createApp(config: Config, deps: AppDeps = {}) {
  const repository = deps.repository ?? new SheetsLeadRepository(config);
  const notifiers = deps.notifiers ?? [new TelegramNotifier(config), new MailNotifier(config)];

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.TRUST_PROXY);

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || config.CORS_ORIGINS.includes(origin)),
      methods: ['GET', 'POST'],
      maxAge: 600,
    }),
  );
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      notifiers: Object.fromEntries(notifiers.map((n) => [n.name, n.enabled])),
      sheets: sheetsEnabled(config),
    });
  });

  app.use('/api', leadRouter({ config, repository, notifiers }));

  app.use('/api', (_req, res) => {
    res.status(404).json({ ok: false, error: 'not_found' });
  });

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    const status = typeof err?.status === 'number' ? err.status : 500;
    if (status >= 500) logger.error('http.error', err);
    res.status(status).json({ ok: false, error: status === 413 ? 'too_large' : status < 500 ? 'bad_request' : 'server' });
  };
  app.use(onError);

  return app;
}
