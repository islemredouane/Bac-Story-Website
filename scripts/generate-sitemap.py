#!/usr/bin/env python3
"""
Regenerate sitemap.xml from the site's real pages.

Run from the project root:   python scripts/generate-sitemap.py

A page is listed only if ALL of these are true:
  - it is an .html file that Cloudflare Pages will publish
    (not git-ignored, not a component, backup, 404 or Apps Script file)
  - it has no <meta name="robots" content="noindex">
  - its <link rel="canonical"> is missing or points to the page's own final URL
    (pages that canonicalise to another URL are duplicates and are left out)

URLs follow Cloudflare Pages rules:  page.html -> /page   folder/index.html -> /folder/
<lastmod> is the date of the last git commit that touched the file.
"""
import os, re, subprocess, sys
from urllib.parse import quote

BASE = 'https://www.bac-story.com'
SKIP_DIRS = {'.git', '.claude', 'node_modules', 'components', 'apps-script', 'scratch', 'scripts'}
SKIP_FILE = re.compile(r'(^|/)(404\.html|google[0-9a-f]+\.html|[^/]*backup[^/]*)$', re.I)
CANON = re.compile(r'<link[^>]*rel=["\']canonical["\'][^>]*>', re.I)
HREF = re.compile(r'href=["\']([^"\']+)["\']', re.I)
NOINDEX = re.compile(r'<meta[^>]*name=["\']robots["\'][^>]*content=["\'][^"\']*noindex', re.I)

def git(*args, stdin=None):
    return subprocess.run(['git', '--no-optional-locks', '-c', 'core.quotepath=false', *args],
                          input=stdin, capture_output=True, text=True, encoding='utf-8').stdout

def url_for(path):
    if path == 'index.html':
        return BASE + '/'
    if path.endswith('/index.html'):
        return BASE + '/' + path[:-len('index.html')]
    return BASE + '/' + path[:-len('.html')]

def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root)

    files = []
    for d, dirs, names in os.walk('.'):
        dirs[:] = [x for x in dirs if x not in SKIP_DIRS]
        for n in names:
            if n.endswith('.html'):
                p = os.path.relpath(os.path.join(d, n), '.').replace(os.sep, '/')
                if not SKIP_FILE.search(p):
                    files.append(p)

    ignored = set(git('check-ignore', '--stdin', stdin='\n'.join(files)).splitlines())

    # last commit date per file, from one pass over the history
    lastmod = {}
    current = None
    for line in git('log', '--format=@%ad', '--date=short', '--name-only', '--', '*.html').splitlines():
        if line.startswith('@'):
            current = line[1:]
        elif line and line not in lastmod:
            lastmod[line] = current

    # URLs that _redirects sends elsewhere are not final pages
    redirected = set()
    if os.path.exists('_redirects'):
        for line in open('_redirects', encoding='utf-8'):
            parts = line.split()
            if len(parts) >= 2 and not parts[0].startswith('#') and '*' not in parts[0]:
                redirected.add(BASE + parts[0].rstrip('/'))

    entries, skipped = {}, []
    for p in sorted(files):
        if p in ignored:
            skipped.append((p, 'git-ignored')); continue
        with open(p, 'rb') as fh:
            head = fh.read(20000).decode('utf-8', 'ignore')
        if NOINDEX.search(head):
            skipped.append((p, 'noindex')); continue
        url = url_for(p)
        if url.rstrip('/') in redirected:
            skipped.append((p, 'redirected in _redirects')); continue
        m = CANON.search(head)
        if m:
            h = HREF.search(m.group(0))
            canonical = h.group(1).strip() if h else ''
            if canonical and canonical != url and not (url == BASE + '/' and canonical == BASE):
                skipped.append((p, 'canonical -> ' + canonical)); continue
        if url in entries:
            skipped.append((p, 'duplicate URL')); continue
        entries[url] = lastmod.get(p)

    def loc(u):
        return BASE + quote(u[len(BASE):], safe="/-_.~%")

    urls = sorted(entries, key=lambda u: (u != BASE + '/', u))
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in urls:
        out.append('  <url>')
        out.append('    <loc>%s</loc>' % loc(u))
        if entries[u]:
            out.append('    <lastmod>%s</lastmod>' % entries[u])
        out.append('  </url>')
    out.append('</urlset>')
    with open('sitemap.xml', 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(out) + '\n')

    print('sitemap.xml: %d URLs written, %d pages left out' % (len(urls), len(skipped)))
    if '-v' in sys.argv:
        for p, why in skipped:
            print('  skipped %-60s %s' % (p, why))

if __name__ == '__main__':
    main()
