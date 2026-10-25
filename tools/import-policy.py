"""Import the client's privacy policy (.docx with ru/en/ka sections) into web/src/app/data/legal.json → privacy.

Headings become {h2}, bullet lists {ul}, other paragraphs {p}; the text itself is not edited.
The `todo` flag stays while the document still contains unfilled placeholders, so build:prod keeps failing.

Usage: python tools/import-policy.py [DOCX]   (default D:/nobel/brend/Noble_Privacy_Policy.docx)
Requires: pip install python-docx
"""
import datetime
import json
import sys
from pathlib import Path

import docx

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else 'D:/nobel/brend/Noble_Privacy_Policy.docx')
OUT = Path(__file__).resolve().parent.parent / 'web/src/app/data/legal.json'
MARKERS = {'РУССКАЯ ВЕРСИЯ': 'ru', 'ENGLISH VERSION': 'en', 'ქართული ვერსია': 'ka'}
PLACEHOLDERS = ('[УКАЗАТЬ]', '[TO BE COMPLETED]', '[შესავსებია]')


def main() -> None:
    body: dict[str, list] = {'ru': [], 'en': [], 'ka': []}
    lang = None
    skip_title = False
    for p in docx.Document(SRC).paragraphs:
        text = p.text.strip()
        style = p.style.name
        if not text:
            continue
        if text in MARKERS:
            lang = MARKERS[text]
            skip_title = True  # next line is the document title, shown in the page hero instead
            continue
        if lang is None:
            continue
        if skip_title:
            skip_title = False
            continue
        if style == 'Meta':  # "Last updated" — the page shows legal.updated
            continue
        blocks = body[lang]
        if style.startswith('Heading'):
            blocks.append({'h2': text})
        elif style == 'List Bullet':
            if blocks and 'ul' in blocks[-1]:
                blocks[-1]['ul'].append(text.rstrip(';.'))
            else:
                blocks.append({'ul': [text.rstrip(';.')]})
        else:
            blocks.append({'p': text})

    raw = json.dumps(body, ensure_ascii=False)
    privacy = {'updated': datetime.date.today().isoformat(), 'source': SRC.name, 'body': body}
    if any(ph in raw for ph in PLACEHOLDERS):
        privacy['todo'] = 'Fill in the data controller (legal entity) and legal address: [УКАЗАТЬ] / [TO BE COMPLETED] / [შესავსებია] placeholders'
    data = json.loads(OUT.read_text(encoding='utf-8'))
    data['privacy'] = privacy
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    sys.stdout.reconfigure(encoding='utf-8')
    for k, v in body.items():
        print(k, len(v), 'blocks,', sum(1 for b in v if 'h2' in b), 'headings')
    print('todo:', privacy.get('todo', 'none'))


if __name__ == '__main__':
    main()
