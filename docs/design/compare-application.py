"""Create honest before/after viewport excerpts; not a source-fidelity score.

Run from repository root: python docs/design/compare-application.py
Requires Pillow. Original full-page screenshots remain intact.
"""
import json
from pathlib import Path

from PIL import Image, ImageDraw

base = Path('docs/design/qa/application')
report = json.loads((base / 'after/results.json').read_text(encoding='utf-8'))
output = base / 'comparisons'
output.mkdir(exist_ok=True)
rows = []
for screen in report['screens']:
    name, width, height = screen['name'], screen['width'], screen['height']
    before = Image.open(base / f'before/{name}-{width}.png').convert('RGB')
    after = Image.open(base / f'after/{name}-{width}.png').convert('RGB')
    canvas = Image.new('RGB', (width * 2, height + 36), '#e6edf7')
    draw = ImageDraw.Draw(canvas)
    draw.text((12, 10), f'BEFORE | {name} | top {height}px', fill='#102552')
    draw.text((width + 12, 10), f'AFTER | {name} | top {height}px', fill='#102552')
    canvas.paste(before.crop((0, 0, width, min(height, before.height))), (0, 36))
    canvas.paste(after.crop((0, 0, width, min(height, after.height))), (width, 36))
    canvas.save(output / f'{name}-{width}.png')
    rows.append(screen)

lines = [
    '# AquaDocs route coverage', '',
    'All backend-dependent captures use intercepted fixtures. This is UI coverage, not live integration.', '',
    'Before/after images are labelled top-of-viewport excerpts; original full-page captures remain available. '
    'No similarity score is assigned to adapted screens without a reference design.', '',
    '| Screen / route | Width | Final overflow | Before / after | Comparison |',
    '| --- | --- | --- | --- | --- |',
]
for s in rows:
    stem = f"{s['name']}-{s['width']}.png"
    lines.append(f"| {s['name']} `{s['route']}` | {s['width']} | {'YES' if s['overflow'] else 'None'} "
                 f"| [before](qa/application/before/{stem}) / [after](qa/application/after/{stem}) "
                 f"| [side by side](qa/application/comparisons/{stem}) |")
Path('docs/design/ROUTE_COVERAGE.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'Created {len(rows)} comparisons and route coverage table.')
