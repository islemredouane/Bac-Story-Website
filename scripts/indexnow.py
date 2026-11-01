#!/usr/bin/env python3
"""
Tell Bing (and every IndexNow search engine) which pages changed in a push.

Run by .github/workflows/indexnow.yml after a deploy:
    python3 scripts/indexnow.py <commit-before> <commit-after> [--dry]

A page is sent only if
  - its .html file was added, changed or renamed, ignoring the ?v=<hash> stamps (a footer or
    CSS change re-stamps every page, and that is not a content change), and
  - it is listed in sitemap.xml (so redirected, duplicate and noindex pages are never sent).
Deleted pages are not sent. The key file at the site root (<key>.txt) proves we own the site.
Before sending, the script waits until the new version is really live (Cloudflare Pages takes
1-3 minutes), otherwise Bing could fetch the old page.
"""
import glob, json, os, re, subprocess, sys, time, urllib.error, urllib.request
from urllib.parse import quote

HOST = 'www.bac-story.com'
MAX_URLS = 2000            # IndexNow allows 10,000 per request; stay polite
WAIT_MINUTES = 8           # how long to wait for the deploy before sending anyway
STAMP = re.compile(r'\?v=[0-9a-f]{10}')
DESC = re.compile(r'<meta[^>]*name="description"[^>]*content="([^"]*)"|<meta[^>]*content="([^"]*)"[^>]*name="description"')

def git(*a):
    r = subprocess.run(['git', '-c', 'core.quotepath=false', *a], capture_output=True,
                       text=True, encoding='utf-8')
    return r.stdout if r.returncode == 0 else ''

def url_for(path):
    # same rules as scripts/generate-sitemap.py, so the address matches the sitemap exactly
    if path == 'index.html': return f'https://{HOST}/'
    if path.endswith('/index.html'): return f'https://{HOST}/' + quote(path[:-len('index.html')], safe='/')
    return f'https://{HOST}/' + quote(path[:-len('.html')], safe='/')

def is_live(url, path):
    """True when the live page already carries this page's current description."""
    m = DESC.search(open(path, encoding='utf-8', errors='ignore').read())
    try:
        with urllib.request.urlopen(urllib.request.Request(url + ('?t=%d' % time.time()), headers={'User-Agent': 'indexnow-check'}), timeout=20) as r:
            live = r.read().decode('utf-8', 'ignore')
    except Exception:
        return False
    return ((m.group(1) or m.group(2)) in live) if m else False

def key_live(key):
    try:
        with urllib.request.urlopen(urllib.request.Request(f'https://{HOST}/{key}.txt?t=%d' % time.time(), headers={'User-Agent': 'indexnow-check'}), timeout=20) as r:
            return r.read().decode().strip() == key
    except Exception:
        return False

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    dry = '--dry' in sys.argv
    before = args[0] if len(args) > 0 else 'HEAD~1'
    after = args[1] if len(args) > 1 else 'HEAD'
    if not before.strip('0') or not git('rev-parse', '--verify', before + '^{commit}'):
        before = 'HEAD~1'          # first push of a branch, or a force-push removed the old commit
    keys = glob.glob('[0-9a-f]' * 32 + '.txt')
    if not keys: sys.exit('no IndexNow key file at the repo root')
    key = os.path.basename(keys[0])[:-4]

    sitemap = set(re.findall(r'<loc>([^<]+)</loc>', open('sitemap.xml', encoding='utf-8').read()))
    changed = git('diff', '--name-only', '--diff-filter=ACMR', before, after, '--', '*.html').split('\n')
    urls = {}
    for p in filter(None, changed):
        if p.startswith(('components/', '.github/', 'scripts/', 'node_modules/')) or 'backup' in p: continue
        u = url_for(p)
        if u not in sitemap or not os.path.exists(p): continue
        new = open(p, encoding='utf-8', errors='ignore').read()
        old = git('show', f'{before}:{p}')
        if old and STAMP.sub('', old) == STAMP.sub('', new): continue   # only ?v= stamps changed
        urls[u] = p
    print(f'{len(urls)} changed page(s) between {before[:8]} and {after[:8]}')
    if not urls: return
    if len(urls) > MAX_URLS: print(f'sending the first {MAX_URLS} of {len(urls)}')
    chosen = sorted(urls)[:MAX_URLS]
    if dry:
        print('dry run, would send', len(chosen), 'URLs, e.g.', chosen[:3]); return

    probe = chosen[0]                                  # wait until the deploy is live (page updated AND key file served)
    deadline = time.time() + WAIT_MINUTES * 60
    while time.time() < deadline and not (is_live(probe, urls[probe]) and key_live(key)):
        print('waiting for the deploy...'); time.sleep(20)

    body = json.dumps({'host': HOST, 'key': key, 'keyLocation': f'https://{HOST}/{key}.txt',
                       'urlList': chosen}).encode()
    req = urllib.request.Request('https://api.indexnow.org/IndexNow', data=body,
                                 headers={'Content-Type': 'application/json; charset=utf-8'})
    try:
        with urllib.request.urlopen(req, timeout=30) as r: print('IndexNow answered', r.status)
    except urllib.error.HTTPError as e:
        print('IndexNow answered', e.code, e.read()[:200]); sys.exit(1)

if __name__ == '__main__':
    main()
