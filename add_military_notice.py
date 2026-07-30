"""
Adds to every military specialty page:
  1. A "منصة التسجيل مغلقة" notice banner ABOVE the inscription button
  2. A "دليل التجنيد" button alongside the existing inscription button

For military-health.html (no acceptance-calc-btn): inserts both before the nav buttons.
"""
import os, re

BASE = os.path.join(os.path.dirname(__file__), "university", "speciality")

# The notice banner (goes above the button wrapper div)
NOTICE = '''\n<div style="margin: 18px 0 14px; padding: 14px 18px; background: linear-gradient(135deg, #fff8e1, #fff3cd); border: 2px solid #f39c12; border-radius: 12px; display: flex; gap: 12px; align-items: flex-start;">
    <span style="font-size: 1.4rem; flex-shrink: 0; margin-top: 1px;">⏳</span>
    <div style="font-size: 0.92rem; line-height: 1.75; color: #7d4e00;">
        <strong>منصة التسجيل مغلقة حالياً.</strong> موقع <strong>preinscription.mdn.dz</strong> يفتح عادةً بعد إعلان نتائج الباكالوريا في <strong>يوليو / أغسطس</strong>. تابع الإعلانات الرسمية لوزارة الدفاع الوطني.
    </div>
</div>'''

# The guide button (added right after the inscription </a>, still inside the wrapper div)
GUIDE_BTN = '''\n<a class="acceptance-calc-btn" href="/university/military-guide" style="display:inline-flex; align-items:center; gap:8px; background: #1e4d0f; margin-top: 10px;">
<i class="fas fa-book-open"></i> دليل التجنيد الكامل
</a>'''

# Block inserted in military-health (no existing button)
HEALTH_BLOCK = '''{notice}
<div style="margin-top:10px; display: flex; flex-wrap: wrap; gap: 10px;">
<a class="acceptance-calc-btn" href="https://preinscription.mdn.dz/" rel="noopener" style="display:inline-flex; align-items:center; gap:8px;" target="_blank">
<i class="fas fa-external-link-alt"></i> التسجيل عبر موقع وزارة الدفاع الوطني
</a>
<a class="acceptance-calc-btn" href="/university/military-guide" style="display:inline-flex; align-items:center; gap:8px; background: #1e4d0f;">
<i class="fas fa-book-open"></i> دليل التجنيد الكامل
</a>
</div>
'''.format(notice=NOTICE)

NAV_MARKER = '<!-- Specialty Navigation Buttons -->'
PREINSCRIPTION_URL = 'href="https://preinscription.mdn.dz/"'

def patch_with_button(content):
    """For files that have the acceptance-calc-btn block."""
    # Find the opening of the wrapper div right before the inscription button
    # Pattern: <div style="margin-top:16px[; text-align: right]?">
    # followed (within a few lines) by the preinscription URL
    # Strategy: find the preinscription URL position, walk back to the preceding <div
    idx = content.find(PREINSCRIPTION_URL)
    if idx == -1:
        return None, "preinscription URL not found"

    # Walk back to find the opening <div
    div_start = content.rfind('<div ', 0, idx)
    if div_start == -1:
        return None, "wrapper <div not found before button"

    # Insert NOTICE just before the wrapper div
    content = content[:div_start] + NOTICE + '\n' + content[div_start:]

    # Now find the closing </a> of the inscription button (after the re-insert)
    idx2 = content.find(PREINSCRIPTION_URL)  # re-find after insertion
    close_a = content.find('</a>', idx2)
    if close_a == -1:
        return None, "closing </a> not found"

    # Insert the guide button right after </a>
    insert_at = close_a + len('</a>')
    content = content[:insert_at] + GUIDE_BTN + content[insert_at:]

    return content, None


def patch_no_button(content):
    """For military-health which has no acceptance-calc-btn."""
    nav_idx = content.find(NAV_MARKER)
    if nav_idx == -1:
        return None, "nav marker not found"
    content = content[:nav_idx] + HEALTH_BLOCK + '\n' + content[nav_idx:]
    return content, None


FILES_WITH_BUTTON = [
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
]

FILES_NO_BUTTON = [
    "military-health.html",
]

for fname in FILES_WITH_BUTTON:
    path = os.path.join(BASE, fname)
    with open(path, encoding="utf-8") as f:
        content = f.read()
    patched, err = patch_with_button(content)
    if err:
        print(f"ERR {fname}: {err}")
    else:
        with open(path, "w", encoding="utf-8") as f:
            f.write(patched)
        print(f"OK  {fname}")

for fname in FILES_NO_BUTTON:
    path = os.path.join(BASE, fname)
    with open(path, encoding="utf-8") as f:
        content = f.read()
    patched, err = patch_no_button(content)
    if err:
        print(f"ERR {fname}: {err}")
    else:
        with open(path, "w", encoding="utf-8") as f:
            f.write(patched)
        print(f"OK  {fname}")

print("\nDone.")
