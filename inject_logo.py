import re, glob

logo_overlay = '<div class="pdf-logo-overlay"><img src="/apple-touch-icon.png" alt="BAC STORY" loading="lazy"></div>'

files = glob.glob('resources/**/exercises.html', recursive=True) + glob.glob('resources/**/resume.html', recursive=True)
for f in files:
    with open(f, encoding='utf-8') as fh:
        html = fh.read()

    if 'pdf-logo-overlay' not in html:
        # Wrap the iframe with pdf-iframe-wrap and inject the logo overlay
        html = re.sub(
            r'(<iframe src="https://drive\.google\.com/file/d/[^"]+/preview"\s+class="responsive-pdf"[^>]+></iframe>)',
            r'<div class="pdf-iframe-wrap">' + logo_overlay + r'\n                    \1\n                    </div>',
            html
        )

    with open(f, 'w', encoding='utf-8') as fh:
        fh.write(html)
    print('Updated', f)
