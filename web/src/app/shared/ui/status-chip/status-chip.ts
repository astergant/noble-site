import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { SITE } from '../../../core/config/site.config';

interface Now {
  day: number;
  minutes: number;
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h! * 60 + (m ?? 0);
};

/**
 * "Open until 20:00" in Asia/Tbilisi time. Prerendered HTML shows the neutral
 * daily schedule; the live state is computed only in the browser after hydration.
 */
@Component({
  selector: 'app-status-chip',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <span
      class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
      [class]="tone() === 'dark' ? 'border-line-dark text-white/85' : 'border-line text-muted'"
    >
      <span
        class="size-2 rounded-full"
        [class]="state() === 'open' ? 'bg-emerald-400' : state() === 'closed' ? (tone() === 'dark' ? 'bg-white/40' : 'bg-subtle') : 'bg-sand'"
        aria-hidden="true"
      ></span>
      @switch (state()) {
        @case ('open') {
          {{ 'status.open' | transloco: { close: today().close } }}
        }
        @case ('closed') {
          {{ 'status.closed' | transloco: { open: nextOpen() } }}
        }
        @default {
          {{ 'status.daily' | transloco: { open: today().open, close: today().close } }}
        }
      }
    </span>
  `,
})
export class StatusChip {
  readonly tone = input<'dark' | 'light'>('dark');

  private readonly site = inject(SITE);
  private readonly now = signal<Now | null>(null);

  protected readonly today = computed(() => {
    const day = this.now()?.day ?? 1;
    return this.site.hours.schedule.find((h) => h.day === day) ?? this.site.hours.schedule[0]!;
  });

  protected readonly state = computed<'open' | 'closed' | 'unknown'>(() => {
    const now = this.now();
    if (!now) return 'unknown';
    const t = this.today();
    return now.minutes >= toMinutes(t.open) && now.minutes < toMinutes(t.close) ? 'open' : 'closed';
  });

  protected readonly nextOpen = computed(() => {
    const now = this.now();
    const t = this.today();
    if (now && now.minutes < toMinutes(t.open)) return t.open;
    const next = this.site.hours.schedule.find((h) => h.day === ((now?.day ?? 1) % 7) + 1);
    return (next ?? t).open;
  });

  constructor() {
    afterNextRender(() => {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: this.site.hours.timezone,
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).formatToParts(new Date());
      const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
      const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday')) + 1;
      this.now.set({ day: day || 1, minutes: Number(get('hour')) * 60 + Number(get('minute')) });
    });
  }
}
