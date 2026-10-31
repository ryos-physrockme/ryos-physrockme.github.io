"""Generate exact QR codes and a portrait PNG from data/card.json.

Requires Pillow and qrcode. Pass an installed Japanese font with --font.
"""
import argparse
import html
import json
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--font', required=True, type=Path, help='Japanese TrueType/OpenType font')
args = parser.parse_args()
card = json.loads((root / 'data/card.json').read_text())
assets = root / 'assets'
ink, muted, purple = '#222222', '#62606a', '#65508e'
canvas = Image.new('RGB', (1080, 1440), 'white')
draw = ImageDraw.Draw(canvas)

def line(text, y, size, color=ink, x=84):
    font = ImageFont.truetype(str(args.font), size)
    if draw.textlength(text, font=font) > 912:
        raise ValueError(f'Text exceeds card width: {text}')
    draw.text((x, y), text, fill=color, font=font, anchor='lt')

draw.rectangle((84, 91, 996, 99), fill=purple)
line(card['nameJa'], 173, 82)
line(card['nameEn'], 281, 46, muted)
line(card['affiliationJa'][0], 411, 37)
line(' · '.join(card['affiliationJa'][1:]), 468, 34)
line(card['affiliationEn'][0], 551, 30, muted)
line(card['affiliationEn'][1], 596, 29, muted)
line(card['email'], 761, 36, purple)
line(card['website'].removeprefix('https://').rstrip('/'), 820, 34, purple)

for index, (kind, label, payload) in enumerate([
    ('website', 'Website', card['website']),
    ('email', 'Email', 'mailto:' + card['email']),
]):
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=4, box_size=10)
    qr.add_data(payload, optimize=0)
    qr.make(fit=True)
    matrix = qr.get_matrix()
    n = len(matrix)
    blocks = ''.join(f'M{x},{y}h1v1h-1z' for y, row in enumerate(matrix) for x, value in enumerate(row) if value)
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n} {n}" shape-rendering="crispEdges" role="img"><title>{html.escape(label + ": " + payload)}</title><rect width="{n}" height="{n}" fill="white"/><path d="{blocks}" fill="black"/></svg>\n'
    (assets / f'card-{kind}.svg').write_text(svg)
    x = 89 + index * 494
    label_font = ImageFont.truetype(str(args.font), 36)
    draw.text((x + 207, 918), label, fill=ink, font=label_font, anchor='mt')
    pixels_per_module = 370 // n
    qr_img = qr.make_image(fill_color='black', back_color='white').convert('RGB')
    qr_img = qr_img.resize((n * pixels_per_module, n * pixels_per_module), Image.Resampling.NEAREST)
    canvas.paste(qr_img, (x + (414 - qr_img.width) // 2, 986))

destination = assets / 'ryosuke-suda-card.png'
canvas.save(destination, optimize=True)
print(f'Created {destination.name} (1080 × 1440) and two QR SVGs.')
