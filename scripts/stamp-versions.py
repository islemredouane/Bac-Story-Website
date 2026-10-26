#!/usr/bin/env python3
"""
Give every versioned asset link the content hash of the file it points to.

The site's CSS, JS, fonts and components are cached by browsers for a year (see _headers).
That is only safe because every link to them carries ?v=<version>: a browser keeps one copy per
full address, so a new ?v= is a new file and it is downloaded at once. This script makes that
automatic. It finds every local link written as  /path/to/file?v=<anything>  in the site's
.html, .js and .css files and sets <anything> to the first 10 hex digits of the SHA-1 of that
file. A file that did not change keeps the same link; a file that changed gets a new one, so a
forgotten version bump is impossible.

Files that link to other versioned files (fa.css -> its fonts, shared.js -> navbar/footer/
search/search-index) are stamped first, so their own hash already includes the new links.

WHEN TO RUN IT: after editing any CSS, JS, font, component (navbar/footer/search) or
search-index.json, before you commit:

    python3 scripts/stamp-versions.py           # rewrite the links
    python3 scripts/stamp-versions.py --check   # change nothing; exit 1 if a link is stale,
                                                # broken, or a local CSS/JS file is linked
                                                # without ?v= (it would be cached for a year)

Only the ?v= part of existing links is changed. Line endings and everything else in the files
are kept byte for byte.

Limits: only site-absolute links written in the files (/path?v=...) are seen. A CSS/JS file that a
script builds a URL for at run time, or links by a relative or full-domain address, is not
checked; link such files as /path?v=... like the others.

A change to navbar/footer/search or search-index.json changes components/shared.js (it links
them), so every page's shared.js link changes too: a diff touching all pages is normal then.

Enforced by .githooks/pre-commit (enable with: git config core.hooksPath .githooks) and by the
GitHub workflow .github/workflows/check-versions.yml on every push.
"""
import argparse, hashlib, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {'.git', 'node_modules', '.wrangler', 'scripts', 'functions', '.github'}
SCAN_EXT = ('.html', '.js', '.css')

# /path?v=version, inside quotes or url(...). The path is site-absolute.
LINK = re.compile(r'''(?<=["'(])(/[A-Za-z0-9_\-./]+)\?v=([A-Za-z0-9._\-]*)(?=["')&#])''')
# <script src="/x.js"> or <link href="/x.css"> with no ?v= at all.
UNVERSIONED = re.compile(r'''(?:src|href)=["'](/[A-Za-z0-9_\-./]+\.(?:css|js))["']''')


def read(path):
    with open(path, 'rb') as f:
        return f.read()


def target_of(url_path):
    """The file a site path is served from (components are linked without .html)."""
    p = os.path.join(ROOT, url_path.lstrip('/'))
    if os.path.isfile(p):
        return p
    if os.path.isfile(p + '.html'):
        return p + '.html'
    return None


def site_files():
    for d, dirs, files in os.walk(ROOT):
        dirs[:] = sorted(x for x in dirs if x not in SKIP_DIRS)
        for f in sorted(files):
            if f.endswith(SCAN_EXT):
                yield os.path.join(d, f)


class Stamper:
    def __init__(self):
        self.new_text = {}      # file -> rewritten text (only for files that link to assets)
        self.versions = {}      # asset file -> hash of its final content
        self.broken = []        # (file, link) whose target does not exist
        self.stale = {}         # asset -> files that link to an old version of it
        self.visiting = set()

    def text_of(self, path):
        return read(path).decode('utf-8')

    def version(self, asset):
        """Hash of the asset after its own links have been stamped."""
        if asset in self.versions:
            return self.versions[asset]
        if asset in self.visiting:
            raise SystemExit(f'circular ?v= links through {os.path.relpath(asset, ROOT)}')
        self.visiting.add(asset)
        if asset.endswith(SCAN_EXT) or asset.endswith('.html'):
            data = self.stamp(asset).encode('utf-8')
        else:
            data = read(asset)
        self.visiting.discard(asset)
        self.versions[asset] = hashlib.sha1(data).hexdigest()[:10]
        return self.versions[asset]

    def stamp(self, path):
        """The file's text with every ?v= set to its target's hash."""
        if path in self.new_text:
            return self.new_text[path]
        text = self.text_of(path)

        def repl(m):
            target = target_of(m.group(1))
            if target is None:
                self.broken.append((path, m.group(0)))
                return m.group(0)
            v = self.version(target)
            if v != m.group(2):
                self.stale.setdefault(target, set()).add(path)
            return f'{m.group(1)}?v={v}'

        self.new_text[path] = LINK.sub(repl, text)
        return self.new_text[path]


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    ap.add_argument('--check', action='store_true', help='report problems, change nothing')
    args = ap.parse_args()

    s = Stamper()
    changed, unversioned = [], []
    for path in site_files():
        old = s.text_of(path)
        new = s.stamp(path)
        if new != old:
            changed.append(path)
        if path.endswith('.html'):
            for m in UNVERSIONED.finditer(old):
                if target_of(m.group(1)):
                    unversioned.append((path, m.group(1)))

    rel = lambda p: os.path.relpath(p, ROOT)
    for path, link in s.broken:
        print(f'BROKEN   {rel(path)}: {link} (no such file)')
    for path, link in unversioned:
        print(f'NO ?v=   {rel(path)}: {link}')

    if args.check:
        for asset, files in sorted(s.stale.items()):
            print(f'STALE    {rel(asset)} changed; {len(files)} file(s) still link its old version')
        ok = not (changed or s.broken or unversioned)
        print('all links up to date' if ok else 'run: python3 scripts/stamp-versions.py')
        sys.exit(0 if ok else 1)

    for path in changed:
        with open(path, 'wb') as f:
            f.write(s.new_text[path].encode('utf-8'))
    print(f'{len(changed)} file(s) updated; {len(s.versions)} versioned asset(s)')
    for asset, v in sorted(s.versions.items()):
        print(f'  {rel(asset):40} ?v={v}')
    sys.exit(1 if (s.broken or unversioned) else 0)


if __name__ == '__main__':
    main()
