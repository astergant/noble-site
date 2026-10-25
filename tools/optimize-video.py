"""Build web videos from the source clips listed in web/src/app/data/videos.json.

For every entry: converts iPhone HDR (HLG / BT.2020, 10-bit) to SDR BT.709, scales to 720 px wide,
drops audio and metadata, re-encodes to H.264 MP4 (+faststart, 30 fps) and writes a WebP poster:
  web/public/media/video/<id>.mp4, web/public/media/video/<id>-poster.webp
width/height/duration/sizeKb are written back to videos.json; hand-written fields are preserved.
Only scaling, tone mapping and re-encoding are applied — no retouching of the footage.

Usage: python tools/optimize-video.py [SOURCE_ROOT]   (default D:/nobel/brend)
Requires: pip install imageio-ffmpeg pillow   (imageio-ffmpeg ships a static ffmpeg binary)
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import imageio_ffmpeg
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE_ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else 'D:/nobel/brend')
DATA = ROOT / 'web/src/app/data/videos.json'
OUT = ROOT / 'web/public/media/video'
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

WIDTH = 720
CRF = 26
POSTER_AT = 1.0

HDR_TO_SDR = (
    'zscale=tin=arib-std-b67:min=bt2020nc:pin=bt2020:rin=tv:t=linear:npl=100,format=gbrpf32le,'
    'zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p'
)


def probe(src: Path) -> str:
    return subprocess.run([FFMPEG, '-hide_banner', '-i', str(src)], capture_output=True, text=True, errors='replace').stderr


def main() -> None:
    videos = json.loads(DATA.read_text(encoding='utf-8'))
    OUT.mkdir(parents=True, exist_ok=True)
    for v in videos:
        src = SOURCE_ROOT / v['source']
        if not src.exists():
            print(f'  missing source for {v["id"]}: {src}')
            continue
        info = probe(src)
        hdr = 'arib-std-b67' in info or 'smpte2084' in info
        vf = f'scale={WIDTH}:-2:flags=lanczos,fps=30' + (f',{HDR_TO_SDR}' if hdr else ',format=yuv420p')
        mp4 = OUT / f'{v["id"]}.mp4'
        subprocess.run(
            [FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(src), '-map', '0:v:0', '-an', '-sn', '-dn',
             '-map_metadata', '-1', '-vf', vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', str(CRF),
             '-profile:v', 'high', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
             '-movflags', '+faststart', str(mp4)],
            check=True,
        )
        poster_png = OUT / f'{v["id"]}-poster.png'
        subprocess.run(
            [FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', '-ss', str(POSTER_AT), '-i', str(mp4),
             '-frames:v', '1', str(poster_png)],
            check=True,
        )
        with Image.open(poster_png) as im:
            width, height = im.size
            im.convert('RGB').save(OUT / f'{v["id"]}-poster.webp', 'WEBP', quality=72, method=6)
        poster_png.unlink()
        m = re.search(r'Duration: (\d+):(\d+):([\d.]+)', probe(mp4))
        duration = round(int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3]), 1) if m else None
        size_kb = round(mp4.stat().st_size / 1024)
        v.update(width=width, height=height, duration=duration, sizeKb=size_kb)
        print(f'{v["id"]}: {width}x{height}, {duration}s, {size_kb} KB (hdr={hdr})')
    DATA.write_text(json.dumps(videos, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
