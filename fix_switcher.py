import re

# 1. Update style.css
with open("style.css", "r", encoding="utf-8") as f:
    css = f.read()

new_css = """
/* ── Premium PDF Switcher Bar (Moktasabat & Multi-file views) ── */
.pdf-switcher-wrap {
    text-align: center;
    margin: 0 0 20px 0;
}
.pdf-switcher-toggle {
    display: inline-flex;
    align-items: center;
    position: relative;
    vertical-align: top;
    background: #f1f5f9;
    border-radius: 999px;
    padding: 4px;
    gap: 0;
    overflow: hidden;
}
.pdf-switcher-pill {
    position: absolute;
    top: 4px; bottom: 4px;
    background: #2c5cc5;
    border-radius: 999px;
    transition: left 0.28s cubic-bezier(0.34,1.56,0.64,1), width 0.28s cubic-bezier(0.34,1.56,0.64,1);
    box-shadow: 0 2px 8px rgba(44,92,195,0.3);
    pointer-events: none;
    z-index: 0;
}
.pdf-switcher-tab {
    position: relative; z-index: 1;
    margin: 0 !important;
    padding: 0.5rem 1.4rem;
    border: none; background: transparent; border-radius: 999px;
    font-family: 'Tajawal', sans-serif; font-size: 0.9rem; font-weight: 700;
    color: #64748b; cursor: pointer; white-space: nowrap;
    transition: color 0.22s ease;
    display: inline-flex; align-items: center; gap: 6px;
    user-select: none;
}
.pdf-switcher-tab.active {
    color: #fff;
}
@media (max-width: 600px) {
    .pdf-switcher-wrap { display: flex; justify-content: center; }
    .pdf-switcher-toggle { max-width: 100%; }
    .pdf-switcher-tab { padding: 0.5rem 0.9rem; font-size: 0.8rem; }
}
"""

# Replace old css with new css
css = re.sub(r'/\* ─── TAB SWITCHER BAR ──────────────────────── \*/.*?(?=/\* ── BUILD OEB CONTENT)', '', css, flags=re.DOTALL) # Just in case we added anything here, but we didn't.
# Wait, I previously injected pdf-switcher CSS. I should just append this or replace the old one.
css = re.sub(r'/\*\s*Premium PDF Switcher Bar.*?\.pdf-switcher-btn\.active i\s*{\s*color:\s*#2c5cc5;\s*}', new_css, css, flags=re.DOTALL)

with open("style.css", "w", encoding="utf-8") as f:
    f.write(css)
print("Updated style.css")

# 2. Update exercises.html
files_to_update = [
    "resources/math/math/moktasabat/exercises.html",
    "resources/sci/math/moktasabat/exercises.html",
    "resources/engineering/math/moktasabat/exercises.html"
]

switcher_html = """
                    <div class="pdf-switcher-wrap">
                        <div class="pdf-switcher-toggle" id="pdfTabBar">
                            <span class="pdf-switcher-pill" id="pdfTabPill"></span>
                            <button class="pdf-switcher-tab active" onclick="switchPdf(this, 'FILE_ID_1')"><i class="fas fa-file-pdf"></i> السلسلة 1</button>
                            <button class="pdf-switcher-tab" onclick="switchPdf(this, 'FILE_ID_2')"><i class="fas fa-file-pdf"></i> السلسلة 2</button>
                            <button class="pdf-switcher-tab" onclick="switchPdf(this, 'FILE_ID_3')"><i class="fas fa-file-pdf"></i> الحلول</button>
                        </div>
                    </div>
"""

for filepath in files_to_update:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace the previous bs-tab-bar block
    content = re.sub(
        r'<div style="margin-bottom: 20px; display: flex; justify-content: center;">\s*<div class="bs-tab-bar".*?</div>\s*</div>',
        switcher_html.strip(),
        content,
        flags=re.DOTALL
    )
    
    # update the JS init selector to use pdf-switcher-tab
    content = content.replace("querySelector('.bs-tab-btn.active')", "querySelector('.pdf-switcher-tab.active')")
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated {filepath}")

# 3. Update script.js
with open("script.js", "r", encoding="utf-8") as f:
    js_content = f.read()

new_switchPdf = """window.switchPdf = function(button, fileId, isInit = false) {
    const iframe = document.querySelector('.responsive-pdf');
    const downloadBtn = document.querySelector('.down-btn');
    
    if (iframe && !isInit) {
        iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
    }
    if (downloadBtn && !isInit) {
        downloadBtn.href = `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    const bar = button.closest('.pdf-switcher-toggle');
    if (!bar) return;
    
    const allBtns = bar.querySelectorAll('.pdf-switcher-tab');
    allBtns.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const pill = bar.querySelector('.pdf-switcher-pill');
    if (pill) {
        const barRect = bar.getBoundingClientRect();
        const btnRect = button.getBoundingClientRect();
        pill.style.width = btnRect.width + 'px';
        pill.style.left = (btnRect.left - barRect.left) + 'px';
    }

    if (!isInit) {
        button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
};"""

js_content = re.sub(
    r'window\.switchPdf = function\(button, fileId.*?};',
    new_switchPdf,
    js_content,
    flags=re.DOTALL
)

with open("script.js", "w", encoding="utf-8") as f:
    f.write(js_content)
print("Updated script.js")
