import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatDate } from '../../../core/i18n/format';
import { LangService } from '../../../core/i18n/lang.service';
import type { Article } from '../../../core/models';
import { MediaFrame } from '../media-frame/media-frame';

@Component({
  selector: 'app-article-card',
  imports: [RouterLink, TranslocoPipe, MediaFrame],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
  template: `
    @let a = article();
    <a
      [routerLink]="langs.link('/journal/' + a.slug)"
      class="group flex h-full flex-col"
      [class]="featured() ? 'lg:grid lg:grid-cols-[3fr_2fr] lg:items-center lg:gap-12' : ''"
      [class.demo-flag]="a.demo"
    >
      <div class="overflow-hidden rounded-card">
        <app-media-frame
          [id]="a.cover"
          [ratio]="featured() ? '16 / 10' : '4 / 3'"
          [sizes]="featured() ? '(min-width: 1024px) 60vw, 100vw' : '(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw'"
          imgClass="transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
        />
      </div>
      <div>
        <p class="mt-5 text-xs tracking-[0.14em] text-subtle uppercase" [class]="featured() ? 'lg:mt-0' : ''">
          <time [attr.datetime]="a.date">{{ date() }}</time>
          <span aria-hidden="true"> · </span>{{ 'journal.readMinutes' | transloco: { n: a.readMinutes } }}
        </p>
        <h3 class="mt-2 text-night-950 group-hover:underline" [class]="featured() ? 'text-h2' : 'text-h4'">
          {{ langs.pick(a.title) }}
        </h3>
        <p class="mt-3 text-muted">{{ langs.pick(a.excerpt) }}</p>
      </div>
    </a>
  `,
})
export class ArticleCard {
  protected readonly langs = inject(LangService);
  readonly article = input.required<Article>();
  readonly featured = input(false);
  protected readonly date = computed(() => formatDate(this.article().date, this.langs.lang()));
}
