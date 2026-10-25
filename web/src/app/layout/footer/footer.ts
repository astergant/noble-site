import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { ContactService } from '../../core/config/contact.service';
import { LangService } from '../../core/i18n/lang.service';
import { Icon } from '../../shared/ui/icon/icon';
import { StatusChip } from '../../shared/ui/status-chip/status-chip';
import { FOOTER_NAV } from '../nav-items';

@Component({
  selector: 'footer[app-footer]',
  imports: [NgOptimizedImage, RouterLink, TranslocoPipe, Icon, StatusChip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'on-dark block bg-night-950 text-white/75' },
  templateUrl: './footer.html',
})
export class Footer {
  protected readonly langs = inject(LangService);
  protected readonly contact = inject(ContactService);
  protected readonly site = this.contact.site;
  protected readonly nav = FOOTER_NAV;
  protected readonly year = new Date().getFullYear();
  protected readonly hours = this.site.hours.schedule[0]!;
}
