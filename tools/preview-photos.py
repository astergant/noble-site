"""Contact sheet of source photos for quick review. Usage: python tools/preview-photos.py SRC_DIR OUT.jpg"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps
from pillow_heif import register_heif_opener

register_heif_opener()

src, out = Path(sys.argv[1]), sys.argv[2]
files = sorted(p for p in src.iterdir() if p.suffix.lower() in {'.jpg', '.jpeg', '.png', '.heic', '.webp'})
cell = 420
cols = 3
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * cell, rows * (cell + 24)), 'white')
draw = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = ImageOps.exif_transpose(Image.open(f)).convert('RGB')
    print(f.name, im.size)
    im.thumbnail((cell - 8, cell - 8))
    x, y = (i % cols) * cell, (i // cols) * (cell + 24)
    sheet.paste(im, (x + (cell - im.width) // 2, y + (cell - im.height) // 2))
    draw.text((x + 6, y + cell + 4), f.name, fill='black')
sheet.save(out, quality=80)
