import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type ConsentState = 'granted' | 'denied' | 'unknown';

const KEY = 'noble.consent.v1';

/** Stores the visitor's analytics choice. localStorage is a convenience only (try/catch). */
@Injectable({ providedIn: 'root' })
export class ConsentService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly state = signal<ConsentState>('unknown');

  constructor() {
    if (!this.browser) return;
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'granted' || saved === 'denied') this.state.set(saved);
    } catch {
      /* storage unavailable: ask again next visit */
    }
  }

  set(value: Exclude<ConsentState, 'unknown'>): void {
    this.state.set(value);
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
  }
}
