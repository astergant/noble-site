import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Eyebrow + H2 + optional lead. Projected content goes to the right on wide screens (e.g. a "See all" link). */
@Component({
  selector: 'app-section-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-6 md:flex-row md:items-end md:justify-between' },
  template: `
    <div class="max-w-3xl">
      @if (eyebrow()) {
        <p class="eyebrow" [class.text-sand-700]="!dark()">{{ eyebrow() }}</p>
      }
      <h2 [id]="headingId() || null" class="mt-3 text-h2" [class.text-white]="dark()" [class.text-night-950]="!dark()">
        {{ title() }}
      </h2>
      @if (lead()) {
        <p class="mt-4 text-lead" [class.text-white/70]="dark()" [class.text-muted]="!dark()">{{ lead() }}</p>
      }
    </div>
    <ng-content />
  `,
})
export class SectionHeading {
  readonly title = input.required<string>();
  readonly eyebrow = input('');
  readonly lead = input('');
  readonly dark = input(false);
  readonly headingId = input('');
}
