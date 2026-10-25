import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ContentService } from '../../core/data/content.service';
import { LangService } from '../../core/i18n/lang.service';
import type { ServiceCategory } from '../../core/models';
import { breadcrumbLd } from '../../core/seo/json-ld';
import { SeoService } from '../../core/seo/seo.service';
import { ContactCta } from '../../shared/ui/contact-cta/contact-cta';
import { PageHero } from '../../shared/ui/page-hero/page-hero';
import { SectionHeading } from '../../shared/ui/section-heading/section-heading';
import { VideoClip } from '../../shared/ui/video-clip/video-clip';
import { WorksGrid } from '../../shared/ui/works-grid/works-grid';

@Component({
  selector: 'app-works-page',
  imports: [TranslocoPipe, PageHero, WorksGrid, SectionHeading, VideoClip, ContactCta],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      [title]="'pages.works.title' | transloco"
      [eyebrow]="'pages.works.eyebrow' | transloco"
      [lead]="'pages.works.lead' | transloco"
      [crumbs]="[{ label: 'nav.works' | transloco }]"
    />

    <section class="container-page py-section">
      @if (filters().length > 1) {
        <div class="flex flex-wrap gap-2" role="group" [attr.aria-label]="'works.filterAria' | transloco">
          <button type="button" [class]="chip(null)" [attr.aria-pressed]="active() === null" (click)="active.set(null)">
            {{ 'works.all' | transloco }}
          </button>
          @for (c of filters(); track c) {
            <button type="button" [class]="chip(c)" [attr.aria-pressed]="active() === c" (click)="active.set(c)">
              {{ 'categories.' + c | transloco }}
            </button>
          }
        </div>
      }
      <app-works-grid class="mt-10" [works]="visible()" />
      <p class="mt-4 text-sm text-subtle">{{ 'works.tapHint' | transloco }}</p>
      <p class="mt-10 text-sm text-subtle">{{ 'works.more' | transloco }}</p>
    </section>

    @if (videos.length) {
      <section class="border-t border-line py-section" aria-labelledby="videos-title">
        <div class="container-page">
          <app-section-heading headingId="videos-title" [title]="'works.videos' | transloco" [lead]="'works.videosLead' | transloco" />
          <ul class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (v of videos; track v.id) {
              <li><app-video-clip [video]="v" /></li>
            }
          </ul>
        </div>
      </section>
    }

    <app-contact-cta placement="works_cta" />
  `,
})
export class WorksPage {
  private readonly langs = inject(LangService);
  private readonly content = inject(ContentService);
  private readonly seo = inject(SeoService);

  protected readonly videos = this.content.videos;
  protected readonly active = signal<ServiceCategory | null>(null);

  private categoryOf(slug: string): ServiceCategory | undefined {
    return this.content.service(slug)?.category;
  }

  protected readonly filters = computed(() => {
    const used = new Set(this.content.works.flatMap((w) => w.serviceSlugs.map((s) => this.categoryOf(s))));
    return this.content.categories().map((g) => g.category).filter((c) => used.has(c));
  });

  protected readonly visible = computed(() => {
    const c = this.active();
    return c ? this.content.works.filter((w) => w.serviceSlugs.some((s) => this.categoryOf(s) === c)) : this.content.works;
  });

  protected chip(c: ServiceCategory | null): string {
    const on = this.active() === c;
    return `rounded-full border px-4 py-2 text-sm transition-colors ${
      on ? 'border-night bg-night text-white' : 'border-line text-ink hover:border-night/40'
    }`;
  }

  constructor() {
    effect(() => {
      this.langs.lang();
      this.seo.set({
        title: this.langs.t('seo.works.title'),
        description: this.langs.t('seo.works.description'),
        path: '/works',
        jsonLd: [
          breadcrumbLd([
            { name: this.langs.t('breadcrumbs.home'), url: this.seo.url('/') },
            { name: this.langs.t('nav.works'), url: this.seo.url('/works') },
          ]),
        ],
      });
    });
  }
}
