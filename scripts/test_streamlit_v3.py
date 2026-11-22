"""Run with the same Python dependencies as app.py."""
import unittest
from pathlib import Path
from urllib.parse import urlsplit

from streamlit.testing.v1 import AppTest

from lesson_assets import MANIFEST, resolve

APP = str(Path(__file__).resolve().parents[1] / 'app.py')


class SourceTests(unittest.TestCase):
    def test_provenance_and_targets(self):
        assets = MANIFEST['assets']
        self.assertEqual(len(assets), len({a['asset_id'] for a in assets}))
        self.assertEqual(len(assets), len({(a['device_family'], a['lesson_id'], a['step_id']) for a in assets}))
        for a in assets:
            self.assertEqual(a['source_page_url'], MANIFEST['sources'][a['source_key']]['page'])
            for k in ('original_image_url', 'source_page_url'):
                url = urlsplit(a[k])
                self.assertEqual(url.scheme, 'https')
                self.assertTrue(url.hostname.endswith('.apple.com' if a['device_family'] == 'iphone' else '.samsung.com'))
            if 'target' in a:
                x, y, w, h = a['target']
                self.assertTrue(0 <= x < x+w <= 1 and 0 <= y < y+h <= 1)
        self.assertIsNone(resolve('Unknown', 'signup', 0)[0])
        self.assertIsNone(resolve('iPhone', 'signup', 1)[0])
        self.assertIsNone(resolve('Galaxy', 'wifi', 2)[0])

    def test_start_setup_actual_reference_and_reload(self):
        for device, domain in [('Galaxy', 'images.samsung.com'), ('iPhone', 'cdsassets.apple.com')]:
            with self.subTest(device=device):
                a = AppTest.from_file(APP, default_timeout=20).run()
                self.assertFalse(a.exception)
                self.assertEqual(a.title[0].value, '폰잘알')
                a.button(key='v3_start').click().run()
                a.button(key=f'v3_setup_{device}').click().run()
                self.assertEqual(a.query_params['device'], device)
                a.button(key='guide_pick_signup').click().run()
                links = [e.proto.url for e in a.get('link_button')]
                self.assertTrue(any(urlsplit(u).hostname == domain for u in links))
                a.button(key='guide_next').click().run()
                self.assertTrue(any('원본 화면을 아직 확인하지' in c.value for c in a.caption))
                self.assertFalse(a.exception)
                reopened = AppTest.from_file(APP, default_timeout=20)
                reopened.query_params['device'] = device
                reopened.run().button(key='v3_start').click().run()
                self.assertEqual(reopened.session_state['guide_device_value'], device)
                self.assertEqual(reopened.session_state['page'], 'home')


if __name__ == '__main__':
    unittest.main()
