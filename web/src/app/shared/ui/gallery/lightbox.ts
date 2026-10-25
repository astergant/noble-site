import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LangService } from '../../../core/i18n/lang.service';
import { media } from '../../../core/media/media';
import { Icon } from '../icon/icon';
import { MediaFrame } from '../media-frame/media-frame';

/**
 * Full-screen photo viewer on a native modal <dialog>: the browser handles the focus trap,
 * Esc and focus return. Adds arrow keys, swipe and a counter.
 */
@Component({
  selector: 'app-lightbox',
  imports: [TranslocoPipe, Icon, MediaFrame],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog
      #dialog
      class="lightbox on-dark fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-night-950/95 p-0 text-white"
      [attr.aria-label]="'lightbox.aria' | transloco"
      (close)="onClose()"
      (keydown)="onKey($event)"
    >
      @if (index() !== null) {
        <div class="relative h-full w-full touch-pan-y" (pointerdown)="startX = $event.clientX" (pointerup)="onSwipe($event)">
          <button
            #closeBtn
            type="button"
            class="absolute top-4 right-4 z-10 grid size-12 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            [attr.aria-label]="'common.close' | transloco"
            (click)="close()"
          >
            <app-icon name="x" [size]="22" />
          </button>

          <div class="lightbox-photo absolute inset-x-2 top-20 bottom-24 md:inset-x-24 md:top-12 md:bottom-20">
            @for (id of [current()]; track id) {
              <app-media-frame [id]="id" ratio="fill" fit="contain" sizes="100vw" class="h-full" />
            }
          </div>

          @if (items().length > 1) {
            <button
              type="button"
              class="absolute top-1/2 left-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 md:left-6"
              [attr.aria-label]="'lightbox.prev' | transloco"
              (click)="step(-1)"
            >
              <app-icon name="chevron-left" [size]="24" />
            </button>
            <button
              type="button"
              class="absolute top-1/2 right-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 md:right-6"
              [attr.aria-label]="'lightbox.next' | transloco"
              (click)="step(1)"
            >
              <app-icon name="chevron-right" [size]="24" />
            </button>
          }

          <div class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 px-5 py-5 text-sm text-white/70 md:px-24">
            <p>{{ caption() }}</p>
            <p aria-live="polite" class="shrink-0 tabular-nums">
              {{ 'lightbox.counter' | transloco: { index: index()! + 1, total: items().length } }}
            </p>
          </div>
        </div>
      }
    </dialog>
  `,
})
export class Lightbox {
  private readonly doc = inject(DOCUMENT);
  private readonly langs = inject(LangService);
  private readonly injector = inject(Injector);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly closeBtn = viewChild<ElementRef<HTMLButtonElement>>('closeBtn');

  readonly items = input.required<string[]>();
  /** Optional caption per item; falls back to the photo alt text. */
  readonly captions = input<string[]>([]);

  protected readonly index = signal<number | null>(null);
  protected readonly current = computed(() => this.items()[this.index() ?? 0] ?? '');
  protected readonly caption = computed(
    () => this.captions()[this.index() ?? 0] || this.langs.pick(media(this.current())?.alt),
  );
  protected startX = 0;

  open(i: number): void {
    this.index.set(i);
    this.doc.documentElement.classList.add('overflow-hidden');
    this.dialog().nativeElement.showModal();
    afterNextRender(() => this.closeBtn()?.nativeElement.focus(), { injector: this.injector });
  }

  close(): void {
    this.dialog().nativeElement.close();
  }

  protected step(delta: number): void {
    const n = this.items().length;
    this.index.update((i) => ((i ?? 0) + delta + n) % n);
  }

  protected onKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft') this.step(-1);
    else if (e.key === 'ArrowRight') this.step(1);
  }

  protected onSwipe(e: PointerEvent): void {
    const dx = e.clientX - this.startX;
    if (e.pointerType !== 'mouse' && Math.abs(dx) > 50) this.step(dx < 0 ? 1 : -1);
  }

  protected onClose(): void {
    this.index.set(null);
    this.doc.documentElement.classList.remove('overflow-hidden');
  }
}
