"""Sync the public web edition with the original teaching materials (no secrets)."""
import ast
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from guide_words import WORDS, NAMES
from guide_lessons import FLOWS
from courseware import EXTRA


def literal(file, name):
    return next(ast.literal_eval(n.value) for n in ast.parse((ROOT/file).read_text()).body
                if isinstance(n, ast.Assign) and getattr(n.targets[0], 'id', '') == name)


legacy = {k: {'title': title, 'desc': desc, 'steps': steps, 'category': '처음 시작하기'}
          for k, (title, desc, steps) in literal('app.py', 'LESSONS').items()}
legacy.update(EXTRA)
data = dict(words=WORDS, names=NAMES, flows=FLOWS, legacy=legacy,
            checks=literal('guide_fix.py', 'CHECKS'), cards=literal('guide_ui.py', 'CARDS'),
            paths=literal('guide_ui.py', 'PATHS'))
(ROOT/'web/content.json').write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
