"""Prepare web assets from the brand book folder.

Usage: python tools/brand-assets.py [BRAND_DIR]
Requires: pip install pillow fonttools brotli
"""
import os
import sys
from pathlib import Path

from fontTools import subset
from PIL import Image

BRAND = Path(sys.argv[1] if len(sys.argv) > 1 else 'D:/nobel/brend')
ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'web' / 'public'
OUT_BRAND = PUBLIC / 'brand'
OUT_FONTS = PUBLIC / 'fonts'

# Latin + Latin-1 + Cyrillic + punctuation, в‚ѕ (U+20BE), в…
UNICODES = (
    'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,'
    'U+0400-045F,U+0490-0491,U+04B0-04B1,U+2000-206F,U+20AC,U+20BE,'
    'U+2116,U+2122,U+2190-2199,U+2212,U+2605-2606'
)


def fonts() -> None:
    OUT_FONTS.mkdir(parents=True, exist_ok=True)
    jobs = [(BRAND / 'fonts/Stolzl' / f'{n}.otf', n.replace('_', '-'))
            for n in ('stolzl_light', 'stolzl_book', 'stolzl_regular', 'stolzl_medium')]
    jobs.append((BRAND / 'fonts/Bahnschrift/Bahnschrift.ttf', 'bahnschrift-var'))
    for src, name in jobs:
        subset.main([str(src), f'--unicodes={UNICODES}', '--flavor=woff2',
                     '--layout-features=*', f'--output-file={OUT_FONTS / (name + ".woff2")}'])


def webp(src: Path, name: str, width: int) -> None:
    im = Image.open(src).convert('RGBA')
    height = round(im.height * width / im.width)
    im.resize((width, height), Image.LANCZOS).save(OUT_BRAND / f'{name}.webp', 'WEBP', quality=86, method=6)


def logos() -> None:
    OUT_BRAND.mkdir(parents=True, exist_ok=True)
    web = BRAND / 'logo/Web/without-fon'
    webp(web / 'sign+text/gorizont-companovka/1.png', 'logo-horizontal-night', 280)
    webp(web / 'sign+text/gorizont-companovka/2.png', 'logo-horizontal-sand', 280)
    webp(web / 'sign/1.png', 'sign-night', 256)
    webp(web / 'sign/2.png', 'sign-sand', 160)
    webp(web / 'sign+text/vertical-copanovka/1.png', 'logo-vertical-night', 480)

    sand = Image.open(web / 'sign/2.png').convert('RGBA')
    sand.thumbnail((340, 340))
    icon = Image.new('RGBA', (512, 512), (35, 79, 113, 255))
    icon.alpha_composite(sand, ((512 - sand.width) // 2, (512 - sand.height) // 2))
    icon.convert('RGB').save(OUT_BRAND / 'icon-512.png')
    icon.resize((192, 192), Image.LANCZOS).convert('RGB').save(OUT_BRAND / 'icon-192.png')
    icon.resize((180, 180), Image.LANCZOS).convert('RGB').save(OUT_BRAND / 'apple-touch-icon.png')
    icon.resize((48, 48), Image.LANCZOS).save(PUBLIC / 'favicon.ico', sizes=[(48, 48), (32, 32), (16, 16)])


def patterns() -> None:
    """Crown row (horizontal pattern) and single crown, from 'РЎС‚РёР»РµРѕР±СЂР°Р·СѓСЋС‰РёРµ СЌР»РµРјРµРЅС‚С‹/Web'."""
    root = next(p for p in BRAND.iterdir() if p.is_dir() and p.name.startswith('РЎС‚РёР»'))
    web = root / 'Web'
    rows = sorted(next(p for p in web.iterdir() if p.name.startswith('Р“РѕСЂ')).glob('*.png'))
    crowns = sorted(next(p for p in web.iterdir() if p.name.startswith('РљРѕСЂ')).glob('*.png'))
    for i, src in enumerate(rows, 1):
        im = Image.open(src).convert('RGBA')
        im = im.resize((round(im.width * 32 / im.height), 32), Image.LANCZOS)
        # one seamless tile: find the period by cropping to ~1/16 of the strip
        im.save(OUT_BRAND / f'crown-row-{i}.webp', 'WEBP', quality=86, method=6)
        print('row', i, src.name, im.size, im.getpixel((im.width // 2, im.height - 4)))
    for i, src in enumerate(crowns, 1):
        webp(src, f'crown-{i}', 1200)
        print('crown', i, src.name)


def og_image() -> None:
    """Default Open Graph preview 1200Г—630: Noble Night, sand logo, crown row at the bottom."""
    w, h = 1200, 630
    canvas = Image.new('RGBA', (w, h), (35, 79, 113, 255))
    logo = Image.open(BRAND / 'logo/Web/without-fon/sign+text/gorizont-companovka/2.png').convert('RGBA')
    logo.thumbnail((620, 620))
    canvas.alpha_composite(logo, ((w - logo.width) // 2, (h - logo.height) // 2 - 30))
    row = Image.open(OUT_BRAND / 'crown-row-3.webp').convert('RGBA')
    row = row.resize((round(row.width * 40 / row.height), 40), Image.LANCZOS)
    for x in range(0, w, row.width):
        canvas.alpha_composite(row, (x, h - 40))
    canvas.convert('RGB').save(OUT_BRAND / 'og-default.jpg', 'JPEG', quality=86, optimize=True)


if __name__ == '__main__':
    fonts()
    logos()
    patterns()
    og_image()
    print('done:', os.listdir(OUT_BRAND))
