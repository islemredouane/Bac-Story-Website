import os, re
html_files = [os.path.join(r, f) for r, _, fs in os.walk('.') for f in fs if f.endswith('.html')]
print('Total HTML files:', len(html_files))
modified = 0
for p in html_files:
    try:
        with open(p, 'r', encoding='utf-8') as f:
            c = f.read()
        nc = re.sub(r'shared\.js\?v=9\.3', 'shared.js?v=9.4', c)
        nc = re.sub(r'script\.js\?v=8\.0', 'script.js?v=8.1', nc)
        if c != nc:
            with open(p, 'w', encoding='utf-8', newline='') as f:
                f.write(nc)
            modified += 1
    except Exception as e:
        print(f"Failed on {p}: {e}")
print('Modified:', modified)
