import nodemailer, { type Transporter } from 'nodemailer';
import type { Config } from '../config.js';
import { leadText } from './format.js';
import type { NotificationProvider, StoredLead } from './types.js';

export class MailNotifier implements NotificationProvider {
  readonly name = 'mail';
  readonly enabled: boolean;
  private transporter?: Transporter;

  constructor(private readonly config: Config) {
    this.enabled = Boolean(config.SMTP_HOST && config.MAIL_TO && config.MAIL_FROM);
    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_SECURE,
        auth: config.SMTP_USER ? { user: config.SMTP_USER, pass: config.SMTP_PASS } : undefined,
      });
    }
  }

  async notify(lead: StoredLead): Promise<void> {
    await this.transporter!.sendMail({
      from: this.config.MAIL_FROM,
      to: this.config.MAIL_TO,
      subject: `Заявка с сайта: ${lead.service ?? 'консультация'}`,
      text: leadText(lead),
    });
  }
}
