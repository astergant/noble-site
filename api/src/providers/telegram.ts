import type { Config } from '../config.js';
import { leadHtml } from './format.js';
import type { NotificationProvider, StoredLead } from './types.js';

export class TelegramNotifier implements NotificationProvider {
  readonly name = 'telegram';
  readonly enabled: boolean;

  constructor(private readonly config: Config) {
    this.enabled = Boolean(config.TELEGRAM_BOT_TOKEN && config.TELEGRAM_CHAT_ID);
  }

  async notify(lead: StoredLead): Promise<void> {
    const res = await fetch(`https://api.telegram.org/bot${this.config.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: this.config.TELEGRAM_CHAT_ID,
        text: leadHtml(lead),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Telegram API responded ${res.status}`);
  }
}
