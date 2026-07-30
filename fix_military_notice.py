"""
Replaces the inline-style notice and green guide button on all 12 military pages with:
  - results-alert gold notice (updated text)
  - plain acceptance-calc-btn guide button
Both placed OUTSIDE all cards, right before <!-- Specialty Navigation Buttons -->
"""
import os, re

BASE = os.path.join(os.path.dirname(__file__), "university", "speciality")
NAV  = '<!-- Specialty Navigation Buttons -->'

FILES = [
    "cherchall.html",
    "enpei.html",
    "esa.html",
    "ensmar.html",
    "esdat.html",
    "gendarmerie.html",
    "republican-guard.html",
    "signal-corps.html",
    "ordnance-corps.html",
    "commissariat-corps.html",
    "military-media.html",
    "military-health.html",
]

# ── patterns to remove ────────────────────────────────────────────────────────

# Old notice div: has exactly one nested div inside, pattern handles that
# \n<div style="margin: 18px 0 14px; ...">   (opening tag)
#     <span>...</span>
#     <div ...>...</div>   ← inner div, first </div> match
# </div>                   ← second </div> match via literal
NOTICE_RE = re.compile(
    r'\n<div style="margin: 18px 0 14px;[^"]*"[^>]*>'  # opening div tag
    r'.*?</div>'                                         # span + inner div content up to inner </div>
    r'\n</div>',                                         # outer </div>
    re.S
)

# Old green guide button (works for both margin-top:10px and no margin-top variants)
GUIDE_BTN_RE = re.compile(
    r'\n<a class="acceptance-calc-btn" href="/university/military-guide" style="[^"]*background: #1e4d0f[^"]*">'
    r'.*?</a>',
    re.S
)

# ── new block to insert before nav marker ─────────────────────────────────────
NEW_BLOCK = (
    '\n<div class="results-alert gold" style="margin: 24px 0 16px;">'
    '\n    <div class="results-alert-icon"><i class="fas fa-clock"></i></div>'
    '\n    <div class="results-alert-body">'
    '\n        <strong>منصة التسجيل مغلقة حالياً.</strong>'
    '\n        <p style="margin: 4px 0 0;">تابع الإعلانات الرسمية لوزارة الدفاع الوطني، ونحن بدورنا سنوافيكم بآخر التفاصيل فور توفرها.</p>'
    '\n    </div>'
    '\n</div>'
    '\n<div style="margin-bottom: 28px;">'
    '\n<a class="acceptance-calc-btn" href="/university/military-guide">'
    '\n<i class="fas fa-book-open"></i> دليل التجنيد الكامل'
    '\n</a>'
    '\n</div>'
    '\n'
)

for fname in FILES:
    path = os.path.join(BASE, fname)
    with open(path, encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. Remove old notice div
    before = content
    content = NOTICE_RE.sub('', content)
    if content == before:
        print(f"WARN {fname}: notice pattern not matched")

    # 2. Remove old green guide button
    before = content
    content = GUIDE_BTN_RE.sub('', content)
    if content == before:
        print(f"WARN {fname}: guide-button pattern not matched")

    # 3. Collapse triple+ blank lines created by removals
    content = re.sub(r'\n{3,}', '\n\n', content)

    # 4. Insert new block before nav marker (only if not already present)
    nav_idx = content.find(NAV)
    if nav_idx == -1:
        print(f"ERR  {fname}: nav marker not found — skipped")
        continue

    if 'results-alert gold' in content:
        print(f"SKIP {fname}: results-alert gold already present")
        continue

    content = content[:nav_idx] + NEW_BLOCK + '    ' + content[nav_idx:]

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"OK   {fname}")

print('\nDone.')
