import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { ContactService } from '../../../core/config/contact.service';
import { ContentService } from '../../../core/data/content.service';
import { LangService } from '../../../core/i18n/lang.service';
import { LeadNoticeService } from './lead-notice.service';

export type LeadSource = 'home' | 'popup_discount';
type Status = 'idle' | 'sending' | 'ok' | 'error' | 'invalid';

const field =
  'mt-1 h-10 w-full rounded-control border border-line bg-white px-3 text-sm text-ink outline-none transition-colors placeholder:text-subtle focus:border-night';
const fieldBad = `${field} border-danger`;

/**
 * Name, phone and service. Posts to /api/lead (proxied locally, Pages Function in production).
 * Personal data is not kept in the browser beyond this request.
 */
@Component({
  selector: 'app-lead-form',
  imports: [RouterLink, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <form (submit)="onSubmit($event)" novalidate class="grid gap-3">
      <div>
        <label class="text-sm text-muted" for="lead-name-{{ source() }}">{{ 'lead.name' | transloco }}</label>
        <input
          id="lead-name-{{ source() }}"
          name="name"
          type="text"
          required
          minlength="2"
          maxlength="80"
          autocomplete="name"
          [class]="miss('name') ? fieldBad : field"
          [attr.placeholder]="'lead.namePh' | transloco"
        />
      </div>
      <div>
        <label class="text-sm text-muted" for="lead-phone-{{ source() }}">{{ 'lead.phone' | transloco }}</label>
        <input
          id="lead-phone-{{ source() }}"
          name="phone"
          type="tel"
          required
          inputmode="tel"
          autocomplete="tel"
          [class]="miss('phone') ? fieldBad : field"
          placeholder="+995 5XX XXX XXX"
        />
      </div>
      <div>
        <label class="text-sm text-muted" for="lead-service-{{ source() }}">{{ 'lead.service' | transloco }}</label>
        <select id="lead-service-{{ source() }}" name="service" required [class]="field">
          <option value="" disabled selected>{{ 'lead.servicePh' | transloco }}</option>
          <option value="_none">{{ 'lead.serviceUnknown' | transloco }}</option>
          @for (s of services; track s.slug) {
            <option [value]="langs.pick(s.name)">{{ langs.pick(s.name) }}</option>
          }
        </select>
      </div>
      <label class="sr-only" aria-hidden="true">
        <input type="text" name="noble_hp" tabindex="-1" autocomplete="off" />
      </label>
      <label class="flex items-start gap-3 text-sm" [class.text-danger]="miss('consent')" [class.text-muted]="!miss('consent')">
        <input type="checkbox" name="consent" required class="mt-1 size-4 accent-night" />
        <span>
          {{ 'lead.consent' | transloco }}
          <a [routerLink]="langs.link('/privacy')" class="underline underline-offset-4 hover:text-night">{{
            'footer.privacy' | transloco
          }}</a>
        </span>
      </label>
      @if (status() === 'invalid') {
        <p class="text-sm text-danger" role="alert">{{ 'lead.required' | transloco }}</p>
      }
      @if (status() === 'error') {
        <p class="text-sm text-danger" role="alert">
          {{ 'lead.error' | transloco }}
          @if (contact.telegram) {
            <a
              [href]="contact.telegram"
              target="_blank"
              rel="noopener"
              (click)="contact.track('telegram', 'lead_error')"
              class="ml-1 underline underline-offset-4"
            >{{ 'contact.viaBot' | transloco }}</a>
          }
        </p>
      }
      @if (status() === 'ok') {
        <p class="rounded-control bg-success-50 px-4 py-3 text-sm text-success" role="status">{{ successKey() | transloco }}</p>
      } @else {
        <button
          type="submit"
          class="inline-flex h-11 items-center justify-center rounded-full bg-night px-6 font-display font-semibold text-white transition-colors hover:bg-night-800 disabled:opacity-60"
          [disabled]="status() === 'sending'"
        >
          {{ (status() === 'sending' ? 'lead.sending' : submitKey()) | transloco }}
        </button>
      }
    </form>
  `,
})
export class LeadForm {
  readonly source = input.required<LeadSource>();
  readonly sent = output<void>();

  protected readonly langs = inject(LangService);
  protected readonly contact = inject(ContactService);
  private readonly analytics = inject(AnalyticsService);
  private readonly notice = inject(LeadNoticeService);
  protected readonly services = inject(ContentService).services;
  protected readonly field = field;
  protected readonly fieldBad = fieldBad;
  protected readonly status = signal<Status>('idle');
  protected readonly missing = signal<Set<string>>(new Set());

  protected miss(key: string): boolean {
    return this.missing().has(key);
  }

  protected submitKey(): string {
    return this.source() === 'popup_discount' ? 'lead.submitDiscount' : 'lead.submit';
  }

  protected successKey(): string {
    return this.source() === 'popup_discount' ? 'lead.successDiscount' : 'lead.success';
  }

  protected async onSubmit(ev: Event): Promise<void> {
    ev.preventDefault();
    if (this.status() === 'sending' || this.status() === 'ok') return;
    const form = ev.target as HTMLFormElement;
    const data = new FormData(form);
    if (String(data.get('noble_hp') ?? '')) {
      this.status.set('ok');
      queueMicrotask(() => this.notice.show());
      return;
    }
    const name = String(data.get('name') ?? '').trim();
    const phone = String(data.get('phone') ?? '').trim();
    const consent = data.get('consent') === 'on';
    const miss = new Set<string>();
    if (name.length < 2) miss.add('name');
    if (phone.replace(/\D/g, '').length < 8) miss.add('phone');
    if (!consent) miss.add('consent');
    this.missing.set(miss);
    if (miss.size) {
      this.status.set('invalid');
      return;
    }
    this.status.set('sending');
    const payload = {
      name,
      phone,
      service: (() => {
        const v = String(data.get('service') ?? '').trim();
        return !v || v === '_none' ? undefined : v;
      })(),
      source: this.source(),
      lang: this.langs.lang(),
      consent: true,
      utm: this.analytics.utm(),
    };
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('lead');
      this.status.set('ok');
      this.analytics.track('lead_submit_success', { source: this.source() });
      try {
        sessionStorage.setItem('noble.lead.sent', '1');
        if (this.source() === 'popup_discount') localStorage.setItem('noble.lead.discount.done', '1');
      } catch {
        /* convenience only */
      }
      this.sent.emit();
      queueMicrotask(() => this.notice.show());
    } catch {
      this.status.set('error');
      this.analytics.track('lead_submit_error', { source: this.source() });
    }
  }
}
