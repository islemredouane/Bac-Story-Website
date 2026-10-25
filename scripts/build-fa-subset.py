#!/usr/bin/env python3
"""
Build the site's own small copy of Font Awesome (fonts/fa/).

The site used to load the full Font Awesome 6.5.1 from cdnjs: ~300 KB of fonts on a
visitor's first page, from a second server, for ~300 icons out of ~2,000. This script scans
every page and script of the site, keeps only the icons that are actually used, and writes:

    fonts/fa/fa.css                 the Font Awesome CSS (classes, sizes, animations) + used icons
    fonts/fa/fa-solid-900.woff2     subset fonts (only the glyphs the site uses)
    fonts/fa/fa-regular-400.woff2
    fonts/fa/fa-brands-400.woff2

and updates the ?v= of fa.css and of the preloaded font in every .html file, so a new
version is never served from an old cache.

WHEN TO RUN IT: after adding an icon that the site never used before (a new fa-xxx class,
or a new "\\fXXX" content code in CSS). Icons that are already used anywhere need nothing.
If you forget, shared.js notices the missing icon in the visitor's browser and loads the full
Font Awesome from cdnjs for that page, so nothing ever shows blank, it is just slower there.

    pip install fonttools brotli
    python3 scripts/build-fa-subset.py            # downloads Font Awesome 6.5.1 from npm once
    python3 scripts/build-fa-subset.py --src DIR  # or use an unpacked @fortawesome/fontawesome-free
"""
import argparse, hashlib, io, os, re, sys, tarfile, urllib.request

FA_VERSION = '6.5.1'
TARBALL = f'https://registry.npmjs.org/@fortawesome/fontawesome-free/-/fontawesome-free-{FA_VERSION}.tgz'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'fonts', 'fa')
SKIP_DIRS = {'.git', 'node_modules', '.wrangler', 'fonts'}
TEXT_EXT = ('.html', '.js', '.json', '.css', '.txt', '.xml')
FONTS = {  # output name -> (source file, @font-face family, weight)
    'fa-solid-900.woff2': ('fa-solid-900.ttf', 'Font Awesome 6 Free', 900),
    'fa-regular-400.woff2': ('fa-regular-400.ttf', 'Font Awesome 6 Free', 400),
    'fa-brands-400.woff2': ('fa-brands-400.ttf', 'Font Awesome 6 Brands', 400),
}


def fetch_source():
    cache = os.path.join(os.path.expanduser('~'), '.cache', f'fontawesome-free-{FA_VERSION}')
    if not os.path.isdir(os.path.join(cache, 'package')):
        print(f'Downloading Font Awesome {FA_VERSION} from npm...')
        data = urllib.request.urlopen(TARBALL, timeout=60).read()
        os.makedirs(cache, exist_ok=True)
        with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as t:
            t.extractall(cache, filter='data') if sys.version_info >= (3, 12) else t.extractall(cache)
    return os.path.join(cache, 'package')


def site_text():
    """Every page, script, stylesheet and data file of the site, as one string."""
    parts = []
    for d, dirs, files in os.walk(ROOT):
        dirs[:] = [x for x in dirs if x not in SKIP_DIRS]
        for f in files:
            if f.endswith(TEXT_EXT) or '.' not in f:
                try:
                    with open(os.path.join(d, f), encoding='utf-8', errors='ignore') as fh:
                        parts.append(fh.read())
                except OSError:
                    pass
    return '\n'.join(parts)


def split_blocks(css):
    """Split a stylesheet into top-level blocks: (prelude, body) or (prelude, None) for ; at-rules."""
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    blocks, i, n = [], 0, len(css)
    while i < n:
        j = i
        while j < n and css[j] not in '{;':
            j += 1
        if j >= n:
            break
        prelude = css[i:j].strip()
        if css[j] == ';':
            blocks.append((prelude, None)); i = j + 1; continue
        depth, k = 1, j + 1
        while k < n and depth:
            depth += {'{': 1, '}': -1}.get(css[k], 0); k += 1
        blocks.append((prelude, css[j + 1:k - 1].strip()))
        i = k
    return [b for b in blocks if b[0]]


def minify(css):
    css = re.sub(r'\s+', ' ', css)
    css = re.sub(r'\s*([{};:,>])\s*', r'\1', css)
    return css.replace(';}', '}').strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', help='unpacked @fortawesome/fontawesome-free package directory')
    src = ap.parse_args().src or fetch_source()
    from fontTools import subset  # imported here so --help works without fonttools

    text = site_text()
    tokens = set(re.findall(r'fa-([a-z0-9]+(?:-[a-z0-9]+)*)', text))
    # Icons drawn straight from CSS: content:"\f078" (also &#xf078; / \uf078 just in case)
    css_codes = {int(c, 16) for c in re.findall(r'\\(?:u)?([ef][0-9a-f]{3})\b', text, re.I)}
    css_codes |= {int(c, 16) for c in re.findall(r'&#x([ef][0-9a-f]{3});', text, re.I)}

    out_rules, used_names, codes = [], set(), set(css_codes)
    for prelude, body in split_blocks(open(os.path.join(src, 'css', 'all.css'), encoding='utf-8').read()):
        if prelude.startswith('@font-face'):
            continue  # replaced by our own @font-face below
        sels = [s.strip() for s in prelude.split(',')]
        names = [re.fullmatch(r'\.fa-([a-z0-9-]+)::?before', s) for s in sels]  # brands use :before
        if body is not None and all(names) and 'content' in body:
            keep = [m.group(1) for m in names if m.group(1) in tokens]
            if not keep:
                continue
            used_names.update(keep)
            m = re.search(r'content:\s*"\\([0-9a-f]+)"', body)
            if m:
                codes.add(int(m.group(1), 16))
            out_rules.append(','.join(f'.fa-{k}::before' for k in keep) + '{' + body + '}')
        else:
            out_rules.append(prelude + ('{' + body + '}' if body is not None else ';'))

    os.makedirs(OUT, exist_ok=True)
    hashes, sizes = {}, {}
    for out_name, (src_name, _, _) in FONTS.items():
        opts = subset.Options()
        opts.flavor = 'woff2'
        opts.layout_features = ['*']
        opts.name_IDs = ['*']
        opts.notdef_outline = True
        font = subset.load_font(os.path.join(src, 'webfonts', src_name), opts)
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=sorted(codes))
        sub.subset(font)
        path = os.path.join(OUT, out_name)
        subset.save_font(font, path, opts)
        data = open(path, 'rb').read()
        hashes[out_name] = hashlib.sha1(data).hexdigest()[:10]
        sizes[out_name] = len(data)

    faces = ''.join(
        "@font-face{font-family:'%s';font-style:normal;font-weight:%d;font-display:block;"
        "src:url(/fonts/fa/%s?v=%s) format('woff2')}" % (fam, w, name, hashes[name])
        for name, (_, fam, w) in FONTS.items())
    header = (f'/*! Font Awesome Free {FA_VERSION} by @fontawesome - https://fontawesome.com '
              f'License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, '
              f'Code: MIT License) Copyright 2023 Fonticons, Inc. | Subset for bac-story.com: '
              f'{len(used_names)} icons, made by scripts/build-fa-subset.py - do not edit by hand */\n')
    css = header + faces + minify('\n'.join(out_rules)) + '\n'
    with open(os.path.join(OUT, 'fa.css'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(css)
    css_hash = hashlib.sha1(css.encode()).hexdigest()[:10]

    # Point every page at the new files (?v= changes only when the content changes).
    pat_css = re.compile(r'/fonts/fa/fa\.css(\?v=[0-9a-f]+)?')
    pat_font = re.compile(r'/fonts/fa/fa-solid-900\.woff2(\?v=[0-9a-f]+)?')
    changed = 0
    for d, dirs, files in os.walk(ROOT):
        dirs[:] = [x for x in dirs if x not in SKIP_DIRS]
        for f in files:
            if not f.endswith('.html'):
                continue
            p = os.path.join(d, f)
            with open(p, encoding='utf-8', newline='') as fh:
                s = fh.read()
            t = pat_css.sub(f'/fonts/fa/fa.css?v={css_hash}', s)
            t = pat_font.sub(f'/fonts/fa/fa-solid-900.woff2?v={hashes["fa-solid-900.woff2"]}', t)
            if t != s:
                with open(p, 'w', encoding='utf-8', newline='') as fh:
                    fh.write(t)
                changed += 1

    print(f'{len(used_names)} icons, {len(codes)} glyphs')
    print(f'fa.css {len(css):,} bytes (v={css_hash})')
    for k, v in sizes.items():
        print(f'{k} {v:,} bytes')
    print(f'{changed} pages updated')


if __name__ == '__main__':
    main()
