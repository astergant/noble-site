import { ChangeDetectionStrategy, Component, computed, inject, input, viewChild } from '@angular/core';
import { ContentService } from '../../../core/data/content.service';
import { LangService } from '../../../core/i18n/lang.service';
import type { Work } from '../../../core/models';
import { Lightbox } from '../gallery/lightbox';
import { Reveal } from '../reveal.directive';
import { WorkCard } from '../work-card/work-card';

/** Grid of work cards sharing one lightbox: photos of all listed cars can be browsed in a row. */
@Component({
  selector: 'app-works-grid',
  imports: [WorkCard, Lightbox, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <ul class="grid grid-cols-2 gap-3 md:gap-5" [class]="gridClass()">
      @for (w of works(); track w.id; let i = $index) {
        <li [appReveal]="(i % 4) * 60"><app-work-card [work]="w" [sizes]="sizes()" (opened)="open(w)" /></li>
      }
    </ul>
    <app-lightbox [items]="photos().items" [captions]="photos().captions" />
  `,
})
export class WorksGrid {
  private readonly langs = inject(LangService);
  private readonly content = inject(ContentService);
  private readonly lightbox = viewChild.required(Lightbox);

  readonly works = input.required<Work[]>();
  readonly gridClass = input('md:grid-cols-3 lg:grid-cols-4');
  readonly sizes = input('(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw');

  protected readonly photos = computed(() => {
    const lang = this.langs.lang();
    const items: string[] = [];
    const captions: string[] = [];
    const start = new Map<string, number>();
    for (const w of this.works()) {
      const ids = [w.cover, ...w.gallery.filter((g) => g !== w.cover)];
      const caption = [w.car, this.content.serviceNames(w, lang)].filter(Boolean).join(' · ');
      start.set(w.id, items.length);
      items.push(...ids);
      captions.push(...ids.map(() => caption));
    }
    return { items, captions, start };
  });

  protected open(w: Work): void {
    this.lightbox().open(this.photos().start.get(w.id) ?? 0);
  }
}
