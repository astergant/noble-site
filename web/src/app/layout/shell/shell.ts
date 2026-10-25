import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { CookieBanner } from '../cookie-banner/cookie-banner';
import { FloatingContacts } from '../floating-contacts/floating-contacts';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';
import { LeadPopup } from '../lead-popup/lead-popup';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, TranslocoPipe, Header, Footer, FloatingContacts, CookieBanner, LeadPopup],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-dvh flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0' },
  template: `
    <a href="#main" class="skip-link">{{ 'common.skipToContent' | transloco }}</a>
    <header app-header></header>
    <main id="main" tabindex="-1" class="flex-1 outline-none">
      <router-outlet />
    </main>
    <footer app-footer></footer>
    <app-floating-contacts />
    <app-cookie-banner />
    <app-lead-popup />
  `,
})
export class Shell {}
