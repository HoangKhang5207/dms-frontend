"""Run from repository root: python docs/design/compare.py (requires Pillow)."""
import base64
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image, ImageChops, ImageStat
from io import BytesIO


root = ET.parse('AquaDocs_AI_banner_no_login.svg').getroot()
embedded = next(element for element in root if element.tag.endswith('image'))
uri = next(value for key, value in embedded.attrib.items() if key.endswith('href'))
reference = Image.open(BytesIO(base64.b64decode(uri.split(',')[1]))).convert('RGB')
output = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('docs/design/qa')
actual = Image.open(output / 'banner-1672.png').convert('RGB')
assert reference.size == actual.size, (reference.size, actual.size)
difference = ImageChops.difference(reference, actual)
different_pixels = sum(count for count, pixel in difference.getcolors(reference.width * reference.height)
                       if pixel != (0, 0, 0))
metrics = {
    'scope': 'banner image region only; excludes retained header and HTML below',
    'dimensions': reference.size,
    'mean_absolute_channel_error': sum(ImageStat.Stat(difference).mean) / 3,
    'different_pixels': different_pixels,
    'total_pixels': reference.width * reference.height,
    'metric': 'RGB absolute difference, no tolerance, no alignment or resizing',
}
(output / 'comparison.json').write_text(json.dumps(metrics, indent=2), encoding='utf-8')
difference.save(output / 'diff.png')
Image.blend(reference, actual, 0.5).save(output / 'overlay.png')
print(json.dumps(metrics, indent=2))
