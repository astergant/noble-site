import { z } from 'zod';

const csv = z
  .string()
  .default('')
  .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean));

const optional = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() ? v.trim() : undefined));

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGINS: csv,
  TRUST_PROXY: z.coerce.number().int().min(0).default(1),
  LEAD_RATE_LIMIT: z.coerce.number().int().positive().default(5),
  LEAD_RATE_WINDOW_MIN: z.coerce.number().int().positive().default(15),
  TELEGRAM_BOT_TOKEN: optional,
  TELEGRAM_CHAT_ID: optional,
  SMTP_HOST: optional,
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
  SMTP_USER: optional,
  SMTP_PASS: optional,
  MAIL_FROM: optional,
  MAIL_TO: optional,
  TURNSTILE_SECRET: optional,
  GOOGLE_SHEET_ID: optional,
  GOOGLE_SHEET_TAB: z.string().default('Лист1'),
  GOOGLE_CLIENT_EMAIL: optional,
  GOOGLE_PRIVATE_KEY: optional,
  GOOGLE_SHEETS_WEBHOOK: optional,
  GOOGLE_SHEETS_TOKEN: optional,
});

export type Config = z.infer<typeof EnvSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => i.path.join('.')).join(', ');
    throw new Error(`Invalid environment configuration: ${fields}`);
  }
  return parsed.data;
}
