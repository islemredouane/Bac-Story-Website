import os, re
html_files = [os.path.join(r, f) for r, _, fs in os.walk('.') for f in fs if f.endswith('.html')]
modified = 0
for p in html_files:
    try:
        with open(p, 'r', encoding='utf-8') as f:
            c = f.read()
        nc = re.sub(r'shared\.js\?v=9\.13', 'shared.js?v=9.14', c)
        nc = re.sub(r'style\.css\?v=9\.26', 'style.css?v=9.27', nc)
        if c != nc:
            with open(p, 'w', encoding='utf-8', newline='') as f:
                f.write(nc)
            modified += 1
    except Exception as e:
        pass
print('Modified:', modified)
