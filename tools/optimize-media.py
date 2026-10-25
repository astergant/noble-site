"""Build web images from source photos listed in web/src/assets/media/manifest.json.

For every entry: fixes EXIF orientation, strips metadata, writes WebP at the standard widths
to web/public/media/<id>-<width>.webp and stores width/height/widths/blur back in the manifest.
Hand-written fields (source, alt, focal) are preserved. HEIC is supported via pillow-heif.

Usage: python tools/optimize-media.py [SOURCE_ROOT]   (default D:/nobel/brend)
Requires: pip install pillow pillow-heif
"""
import base64
import io
import json
import sys
from pathlib import Path

from PIL import Image, ImageOps
from pillow_heif import register_heif_opener

register_heif_opener()

ROOT = Path(__file__).resolve().parent.parent
SOURCE_ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else 'D:/nobel/brend')
MANIFEST = ROOT / 'web/src/assets/media/manifest.json'
OUT = ROOT / 'web/public/media'

# Must match IMAGE_CONFIG.breakpoints in web/src/app/app.config.ts.
WIDTHS = [480, 800, 1200, 1600, 2000]
QUALITY = 78


def blur_placeholder(im: Image.Image) -> str:
    tiny = im.copy()
    tiny.thumbnail((24, 24))
    buf = io.BytesIO()
    tiny.save(buf, 'WEBP', quality=40)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    OUT.mkdir(parents=True, exist_ok=True)
    for media_id, entry in manifest.items():
        src = SOURCE_ROOT / entry['source']
        if not src.exists():
            print(f'  missing source for {media_id}: {src}')
            continue
        im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
        widths = [w for w in WIDTHS if w <= im.width] or [im.width]
        if im.width > widths[-1] and widths[-1] != WIDTHS[-1]:
            widths.append(im.width)
        target_dir = OUT / Path(media_id).parent
        target_dir.mkdir(parents=True, exist_ok=True)
        for w in widths:
            h = round(im.height * w / im.width)
            out = OUT / f'{media_id}-{w}.webp'
            im.resize((w, h), Image.LANCZOS).save(out, 'WEBP', quality=QUALITY, method=6)
        entry.update(width=im.width, height=im.height, widths=widths, blur=blur_placeholder(im))
        size_kb = sum((OUT / f'{media_id}-{w}.webp').stat().st_size for w in widths) / 1024
        print(f'{media_id}: {im.width}x{im.height} -> {widths} ({size_kb:.0f} KB total)')
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
