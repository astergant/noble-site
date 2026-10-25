import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, signal, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LangService } from '../../../core/i18n/lang.service';
import type { Video } from '../../../core/models';
import { Icon } from '../icon/icon';

/**
 * Muted looping clip. Nothing is downloaded until it nears the viewport; it plays only while visible
 * and never autoplays with prefers-reduced-motion. The toggle satisfies WCAG 2.2.2 (pause moving content).
 */
@Component({
  selector: 'app-video-clip',
  imports: [Icon, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <figure class="relative overflow-hidden rounded-card bg-night-950" [style.aspect-ratio]="ratio()">
      <video
        #el
        class="absolute inset-0 h-full w-full object-cover"
        [poster]="base() + '-poster.webp'"
        [attr.width]="video().width"
        [attr.height]="video().height"
        muted
        loop
        playsinline
        disablepictureinpicture
        preload="none"
        [attr.aria-label]="title()"
        (play)="playing.set(true)"
        (pause)="playing.set(false)"
      >
        <source [src]="base() + '.mp4'" type="video/mp4" />
      </video>
      <button
        type="button"
        class="absolute right-3 bottom-3 grid size-11 place-items-center rounded-full bg-night-950/60 text-white backdrop-blur-sm transition-colors hover:bg-night-950/80"
        [attr.aria-label]="(playing() ? 'video.pause' : 'video.play') | transloco"
        (click)="toggle()"
      >
        <app-icon [name]="playing() ? 'pause' : 'play'" [size]="18" />
      </button>
      <figcaption class="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-night-950/80 to-transparent px-4 pt-10 pb-4 pr-16 text-sm text-white">
        {{ title() }}
      </figcaption>
    </figure>
  `,
})
export class VideoClip {
  readonly video = input.required<Video>();

  private readonly langs = inject(LangService);
  private readonly el = viewChild.required<ElementRef<HTMLVideoElement>>('el');
  protected readonly playing = signal(false);
  /** Set once the user pauses manually, so scrolling back doesn't restart the clip. */
  private userPaused = false;
  private visible = false;

  protected readonly base = computed(() => `/media/video/${this.video().id}`);
  protected readonly ratio = computed(() => `${this.video().width} / ${this.video().height}`);
  protected readonly title = computed(() => this.langs.pick(this.video().title));

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const v = this.el().nativeElement;
      v.muted = true;
      if (typeof IntersectionObserver === 'undefined') return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.userPaused = true;
        return;
      }
      const io = new IntersectionObserver(
        ([e]) => {
          this.visible = e.isIntersecting;
          if (this.visible && !this.userPaused) void v.play().catch(() => undefined);
          else if (!this.visible) v.pause();
        },
        { threshold: 0.35 },
      );
      io.observe(v);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }

  protected toggle(): void {
    const v = this.el().nativeElement;
    if (v.paused) {
      this.userPaused = false;
      void v.play().catch(() => undefined);
    } else {
      this.userPaused = true;
      v.pause();
    }
  }
}
