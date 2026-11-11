"""Compare preserved delivery to reverified renders; visual change evidence, not design fidelity."""
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw

root = Path('docs/design/qa/reverification')
report = json.loads((root / 'application-final/results.json').read_text(encoding='utf-8'))
output = root / 'comparisons'
output.mkdir(exist_ok=True)
for screen in report['screens']:
    name = f"{screen['name']}-{screen['width']}.png"
    width, height = screen['width'], screen['height']
    previous = Image.open(Path('docs/design/qa/application/after') / name).convert('RGB').crop((0, 0, width, height))
    current = Image.open(root / 'application-final' / name).convert('RGB').crop((0, 0, width, height))
    side = Image.new('RGB', (width * 2, height + 32), '#e6edf7')
    draw = ImageDraw.Draw(side)
    draw.text((8, 8), 'PREVIOUS DELIVERY', fill='#102552')
    draw.text((width + 8, 8), 'REVERIFIED / LOCAL FONT', fill='#102552')
    side.paste(previous, (0, 32)); side.paste(current, (width, 32))
    side.save(output / name)
    ImageChops.difference(previous, current).save(output / ('diff-' + name))
    Image.blend(previous, current, .5).save(output / ('overlay-' + name))
print(f"Created {len(report['screens'])} labelled comparisons, overlays and differences. No fidelity score.")
