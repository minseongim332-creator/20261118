"""Shared source and rights manifest. Missing or unmatched steps never borrow an image."""
import json
from pathlib import Path

MANIFEST = json.loads((Path(__file__).parent / 'official-lesson-assets.json').read_text(encoding='utf-8'))
ASSETS = {(record['device_family'], record['lesson_id'], record['step_id']): record for record in MANIFEST['assets']}
FAMILIES = {'iPhone': 'iphone', 'Galaxy': 'galaxy'}


def resolve(device, lesson, index, edition='streamlit'):
    family = FAMILIES.get(device)
    if not family or edition not in ('streamlit', 'web'):
        return None, None
    steps = MANIFEST[f'{edition}_steps'].get(lesson, ())
    asset_lesson = 'wifi_connect' if lesson == 'wifi' else lesson
    asset = ASSETS.get((family, asset_lesson, steps[index])) if type(index) is int and 0 <= index < len(steps) else None
    if asset and asset['verification_status'] != 'verified':
        asset = None
    key = asset['source_key'] if asset else MANIFEST['reference_source_keys'].get(family, {}).get(lesson)
    return asset, MANIFEST['sources'].get(key)
