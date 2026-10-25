import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ICONS, iconShapes, type IconName } from './icons';

/** Decorative by default (aria-hidden). Pass `label` for standalone meaningful icons. */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex shrink-0',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
  },
  template: `
    <svg
      viewBox="0 0 24 24"
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.fill]="filled() ? 'currentColor' : 'none'"
      [attr.stroke]="filled() ? null : 'currentColor'"
      [attr.stroke-width]="filled() ? null : stroke()"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      @for (s of shapes(); track $index) {
        @switch (s.tag) {
          @case ('path') {
            <svg:path [attr.d]="s.attrs['d']" />
          }
          @case ('circle') {
            <svg:circle [attr.cx]="s.attrs['cx']" [attr.cy]="s.attrs['cy']" [attr.r]="s.attrs['r']" />
          }
          @case ('rect') {
            <svg:rect
              [attr.x]="s.attrs['x']"
              [attr.y]="s.attrs['y']"
              [attr.width]="s.attrs['width']"
              [attr.height]="s.attrs['height']"
              [attr.rx]="s.attrs['rx']"
              [attr.ry]="s.attrs['ry']"
            />
          }
          @case ('line') {
            <svg:line [attr.x1]="s.attrs['x1']" [attr.x2]="s.attrs['x2']" [attr.y1]="s.attrs['y1']" [attr.y2]="s.attrs['y2']" />
          }
          @case ('polygon') {
            <svg:polygon [attr.points]="s.attrs['points']" />
          }
        }
      }
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input<number | string>(20);
  readonly stroke = input<number>(1.6);
  readonly label = input<string>('');

  protected readonly shapes = computed(() => iconShapes(this.name()));
  protected readonly filled = computed(() => Boolean(ICONS[this.name()].fill));
}
