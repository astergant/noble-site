import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { filter } from 'rxjs';
import { ContactService } from '../../core/config/contact.service';
import { LangService } from '../../core/i18n/lang.service';
import { Icon } from '../../shared/ui/icon/icon';
import { StatusChip } from '../../shared/ui/status-chip/status-chip';
import { LangSwitcher } from '../lang-switcher/lang-switcher';
import { MAIN_NAV } from '../nav-items';

@Component({
  selector: 'header[app-header]',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive, TranslocoPipe, Icon, LangSwitcher, StatusChip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'on-dark sticky top-0 z-40 block isolate border-b border-line-dark text-white [view-transition-name:site-header]',
    '(document:keydown.escape)': 'close()',
  },
  templateUrl: './header.html',
})
export class Header {
  protected readonly langs = inject(LangService);
  protected readonly contact = inject(ContactService);
  protected readonly nav = MAIN_NAV;
  protected readonly open = signal(false);

  private readonly doc = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly burger = viewChild<ElementRef<HTMLButtonElement>>('burger');
  private readonly closeBtn = viewChild<ElementRef<HTMLButtonElement>>('closeBtn');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  constructor() {
    const navEnd = toSignal(inject(Router).events.pipe(filter((e) => e instanceof NavigationEnd)));
    effect(() => {
      navEnd();
      this.open.set(false);
    });
    effect(() => {
      this.doc.documentElement.classList.toggle('overflow-hidden', this.open());
    });
  }

  toggle(): void {
    this.open() ? this.close() : this.show();
  }

  show(): void {
    this.open.set(true);
    afterNextRender(() => this.closeBtn()?.nativeElement.focus(), { injector: this.injector });
  }

  close(): void {
    if (!this.open()) return;
    this.open.set(false);
    afterNextRender(() => this.burger()?.nativeElement.focus(), { injector: this.injector });
  }

  /** Keeps Tab focus inside the open menu dialog. */
  trapFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const panel = this.panel()?.nativeElement;
    if (!panel) return;
    const focusable = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    if (!focusable.length) return;
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (event.shiftKey && this.doc.activeElement === first) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && this.doc.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  }
}
