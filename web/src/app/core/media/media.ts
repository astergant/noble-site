import type { ImageLoaderConfig } from '@angular/common';
import type { L10n } from '../models';
import manifest from '../../../assets/media/manifest.json';

/** One photo processed by tools/optimize-media.py. Files: /media/<id>-<width>.webp */
export interface MediaEntry {
  source: string;
  focal: string;
  alt: L10n;
  width: number;
  height: number;
  widths: number[];
  blur: string;
}

const MEDIA = manifest as Record<string, MediaEntry>;

export function media(id: string | null | undefined): MediaEntry | undefined {
  return id ? MEDIA[id] : undefined;
}

/** IMAGE_LOADER for NgOptimizedImage: `src` is a media id, width snaps to a generated file. */
export function mediaLoader({ src, width }: ImageLoaderConfig): string {
  const entry = MEDIA[src];
  if (!entry) return src;
  const widths = entry.widths;
  const w = (width && widths.find((x) => x >= width)) || widths[widths.length - 1];
  return `/media/${src}-${w}.webp`;
}

/** URL of a large rendition (≥1600px when available), used as the no-JS fallback for lightbox links. */
export function mediaLarge(id: string): string {
  const e = MEDIA[id];
  if (!e) return '#';
  const w = e.widths.find((x) => x >= 1600) ?? e.widths[e.widths.length - 1];
  return `/media/${id}-${w}.webp`;
}

export function mediaSrcset(entry: MediaEntry): string {
  return entry.widths.map((w) => `${w}w`).join(', ');
}
