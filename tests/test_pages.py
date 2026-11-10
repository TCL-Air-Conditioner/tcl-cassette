import json
from pathlib import Path
import re
import subprocess
import unittest

ROOT=Path(__file__).resolve().parents[1]
class PageTest(unittest.TestCase):
    def test_routes_media_and_covers_match_existing_repository(self):
        tree={x['path']:x for x in json.loads((ROOT/'remote-tree.json').read_text())}
        pages=sorted(ROOT.glob('*/index.html'))
        self.assertEqual(len(pages),8)
        for page in pages:
            s=page.read_text()
            catalog=json.loads(re.search(r'<script id="videoCatalog" type="application/json">(.*?)</script>',s).group(1))
            self.assertEqual(len(catalog['topics']),8)
            self.assertIn('video-box video-stage',s)
            self.assertEqual(s.count('class="video-link"'),8)
            for topic in catalog['topics']:
                file=topic['file'].split('?')[0]
                self.assertEqual(topic['hash'],tree[file]['sha'])
                self.assertEqual(topic['bytes'],tree[file]['size'])
                self.assertIn(topic['cover'],tree)
                self.assertEqual(topic['algorithm'],'git-sha1')
            own=next(x for x in catalog['topics'] if x['slug']==page.parent.name)
            self.assertIn(own['file'].split('/')[-1],s)
    def test_rebuild_is_deterministic(self):
        files=list(ROOT.glob('*/index.html'))+[ROOT/'sw.js']
        before={p:p.read_bytes() for p in files}
        subprocess.run(['python3','build_player.py','--manifest','remote-tree.json'],cwd=ROOT,check=True,capture_output=True)
        self.assertEqual(before,{p:p.read_bytes() for p in files})

if __name__=='__main__': unittest.main()
