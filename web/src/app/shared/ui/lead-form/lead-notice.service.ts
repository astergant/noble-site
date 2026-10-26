import { Injectable, signal } from '@angular/core';

/** Global “request accepted” dialog after a successful POST /api/lead. */
@Injectable({ providedIn: 'root' })
export class LeadNoticeService {
  readonly open = signal(false);

  show(): void {
    this.open.set(true);
  }

  hide(): void {
    this.open.set(false);
  }
}
