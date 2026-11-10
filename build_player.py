"""Regenerate playback catalogs and worker using the original MP4 bytes."""
import hashlib
import html
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent
ORDER = ['sky-airflow','app-connect','carpet-style-airflow','7-speed-fan','dehumidification-mode','wide-range-airflow','filter-installation','filter-removal']

def git_info(path):
    size=path.stat().st_size
    h=hashlib.sha1(('blob '+str(size)+'\0').encode())
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024*1024), b''): h.update(chunk)
    return {'sha':h.hexdigest(),'size':size}

def build(manifest=None):
    meta = {x['path']:x for x in json.loads(Path(manifest).read_text())} if manifest else None
    def info(path):
        if meta is not None:
            return meta[str(path.relative_to(ROOT))]
        return git_info(path)
    player=(ROOT/'player.js').read_text(); worker=(ROOT/'sw-template.js').read_text()
    pages={}; topics=[]
    for slug in ORDER:
        path=ROOT/slug/'index.html'; page=path.read_text()
        page=re.sub(r'<script id="videoCatalog" type="application/json">.*?</script>\s*<script src="\.\./player\.js(?:\?v=[0-9a-f]+)?" defer></script>', '<!-- PLAYER_SCRIPTS -->', page, flags=re.S)
        page=re.sub(r'(\.mp4)\?v=[0-9a-f]+',r'\1',page)
        title=html.unescape(re.search(r'<div class="video-title">\s*(.*?)\s*</div>',page,re.S).group(1))
        video=re.search(r'<source\s+src="([^"]+\.mp4)"',page,re.S).group(1)
        cover=re.search(r'id="videoPreview".*?<img\s+src="([^"]+)"',page,re.S).group(1)
        details=info(ROOT/slug/video)
        topics.append({'slug':slug,'title':title,'file':slug+'/'+video+'?v='+details['sha'][:16], 'cover':slug+'/'+cover,'hash':details['sha'],'bytes':details['size'],'algorithm':'git-sha1'})
        pages[slug]=page
    version=hashlib.sha256((player+worker+(ROOT/'assets/training-player.css').read_text()+json.dumps(topics,sort_keys=True)+''.join(pages.values())).encode()).hexdigest()[:16]
    for item in topics:
        page=pages[item['slug']]
        name=item['file'].split('/')[-1].split('?')[0]
        page=page.replace('"'+name+'"','"'+name+'?v='+item['hash'][:16]+'"')
        catalog=json.dumps({'version':version,'root':'../','topics':topics},ensure_ascii=False).replace('<',r'\u003c')
        scripts='<script id="videoCatalog" type="application/json">'+catalog+'</script>\n<script src="../player.js?v='+version+'" defer></script>'
        if page.count('<!-- PLAYER_SCRIPTS -->')!=1: raise ValueError('Missing unique player marker for '+item['slug'])
        (ROOT/item['slug']/'index.html').write_text(page.replace('<!-- PLAYER_SCRIPTS -->',scripts))
    config={'version':version,'pages':[s+'/' for s in ORDER], 'assets':['brand-logo.png','assets/training-player.css','player.js?v='+version]+[t['cover'] for t in topics], 'videos':[{'url':t['file'],'bytes':t['bytes'],'hash':t['hash'],'algorithm':'git-sha1'} for t in topics]}
    (ROOT/'sw.js').write_text(worker.replace('__CACHE_CONFIG__',json.dumps(config,separators=(',',':'))))
    print('Built 8 pages and product-scoped cache; video files were only read.')

if __name__=='__main__':
    if len(sys.argv)>3 or (len(sys.argv)>1 and sys.argv[1]!='--manifest'): raise SystemExit('Usage: python3 build_player.py [--manifest metadata.json]')
    build(sys.argv[2] if len(sys.argv)==3 else None)
