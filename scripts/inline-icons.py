"""Regenerate src/lib/accessory-icons.ts from public/icons/acc-*.svg.

The accessory icons are inlined so their strokes can be drawn on scroll;
`<img>` would put them out of reach of CSS. Run from the project root:

    python -I scripts/inline-icons.py
"""

import io
import json
import re

NAMES = ['acc-magsafe', 'acc-case', 'acc-tripod', 'acc-adapter', 'acc-cable', 'acc-buds']

lines = [
    '// Generated from public/icons/acc-*.svg so the strokes can be drawn on scroll.',
    '// Re-run scripts/inline-icons.py after replacing any accessory icon.',
    '',
    'export const ACCESSORY_ICON_MARKUP: Record<string, string> = {',
]

for name in NAMES:
    svg = io.open('public/icons/%s.svg' % name, encoding='utf-8').read()
    inner = re.search(r'<svg[^>]*>(.*)</svg>', svg, re.S).group(1).strip()
    inner = re.sub(r'\s+', ' ', inner)
    lines.append("  '%s': %s," % (name, json.dumps(inner, ensure_ascii=False)))

lines += ['};', '']
io.open('src/lib/accessory-icons.ts', 'w', encoding='utf-8').write('\n'.join(lines))
print('wrote src/lib/accessory-icons.ts')
