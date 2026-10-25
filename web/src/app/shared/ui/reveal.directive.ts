import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

/**
 * Fades an element in when it scrolls into view. Applied only in the browser after hydration
 * and only to elements below the fold, so prerendered content is never hidden.
 */
@Directive({ selector: '[appReveal]' })
export class Reveal {
  /** Delay in ms, for staggering siblings. */
  readonly appReveal = input<number | ''>('');

  constructor() {
    const el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (el.getBoundingClientRect().top < innerHeight) return;
      const delay = this.appReveal();
      if (delay) el.style.transitionDelay = `${delay}ms`;
      el.classList.add('reveal');
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            el.classList.add('is-visible');
            io.disconnect();
          }
        },
        { rootMargin: '0px 0px -10% 0px' },
      );
      io.observe(el);
    });
  }
}
