import { z } from 'zod';

export const LANGS = ['ka', 'ru', 'en'] as const;

/** International phone: optional +, 8–15 digits, spaces/dashes/brackets allowed. */
const phone = z
  .string()
  .trim()
  .transform((v) => {
    let p = v.replace(/[\s()-]/g, '');
    if (/^5\d{8}$/.test(p)) p = `+995${p}`;
    if (/^995\d{9}$/.test(p)) p = `+${p}`;
    return p;
  })
  .pipe(z.string().regex(/^\+?\d{8,15}$/, 'phone'));

export const LeadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone,
  service: z.string().trim().max(80).optional(),
  car: z.string().trim().max(120).optional(),
  comment: z.string().trim().max(1000).optional(),
  source: z.string().trim().min(1).max(40),
  lang: z.enum(LANGS),
  utm: z.record(z.string().max(40), z.string().max(200)).optional(),
  consent: z.literal(true),
  /** Honeypot. Not named "website" — browsers autofill that and skip the sheet write. */
  noble_hp: z.string().max(200).optional(),
  turnstileToken: z.string().max(2048).optional(),
});

export type LeadInput = z.infer<typeof LeadSchema>;
export type Lead = Omit<LeadInput, 'noble_hp' | 'turnstileToken'>;
