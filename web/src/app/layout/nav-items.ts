export interface NavItem {
  key: string;
  path: string;
}

export const MAIN_NAV: NavItem[] = [
  { key: 'nav.services', path: '/services' },
  { key: 'nav.prices', path: '/prices' },
  { key: 'nav.works', path: '/works' },
  { key: 'nav.about', path: '/about' },
  { key: 'nav.reviews', path: '/reviews' },
  { key: 'nav.contacts', path: '/contacts' },
];

export const FOOTER_NAV: NavItem[] = [
  ...MAIN_NAV.slice(0, 5),
  { key: 'nav.faq', path: '/faq' },
  { key: 'nav.journal', path: '/journal' },
  { key: 'nav.contacts', path: '/contacts' },
];
