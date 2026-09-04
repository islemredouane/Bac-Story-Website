import re

files_to_update = [
    "resources/math/math/moktasabat/exercises.html",
    "resources/sci/math/moktasabat/exercises.html",
    "resources/engineering/math/moktasabat/exercises.html"
]

for filepath in files_to_update:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Remove the old pdf-switcher-container
    content = re.sub(
        r'<div class="pdf-switcher-container">.*?</div>\s*</div>\s*<section class="pdf-viewer"',
        r'<section class="pdf-viewer"',
        content,
        flags=re.DOTALL
    )
    
    # We need to insert the bs-tab-bar exactly below the telegram button and above the iframe
    switcher_html = """
                    <div style="margin-bottom: 20px; display: flex; justify-content: center;">
                        <div class="bs-tab-bar" style="width: auto; display: inline-flex;" id="pdfTabBar">
                            <div class="bs-tab-pill" id="pdfTabPill"></div>
                            <button class="bs-tab-btn active" onclick="switchPdf(this, 'FILE_ID_1')"><i class="fas fa-file-pdf"></i> السلسلة 1</button>
                            <button class="bs-tab-btn" onclick="switchPdf(this, 'FILE_ID_2')"><i class="fas fa-file-pdf"></i> السلسلة 2</button>
                            <button class="bs-tab-btn" onclick="switchPdf(this, 'FILE_ID_3')"><i class="fas fa-file-pdf"></i> الحلول</button>
                        </div>
                    </div>
"""
    
    # Insert switcher after telegram button
    content = content.replace(
        '<span>انضم إلينا على التلغرام</span>\n                    </a>',
        '<span>انضم إلينا على التلغرام</span>\n                    </a>\n' + switcher_html
    )

    # Insert the initialization script at the end of the body
    init_script = """
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const activeBtn = document.querySelector('.bs-tab-btn.active');
            if (activeBtn) {
                setTimeout(() => switchPdf(activeBtn, 'FILE_ID_1', true), 100);
            }
        });
    </script>
    <!-- Cloudflare Web Analytics -->"""
    
    content = content.replace('<!-- Cloudflare Web Analytics -->', init_script)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated {filepath}")

# Update script.js to handle the bs-tab-pill animation for switchPdf
with open("script.js", "r", encoding="utf-8") as f:
    js_content = f.read()

# Replace the old switchPdf function with the new one
new_switchPdf = """window.switchPdf = function(button, fileId, isInit = false) {
    // 1. Update the iframe source
    const iframe = document.querySelector('.responsive-pdf');
    const downloadBtn = document.querySelector('.down-btn');
    
    if (iframe && !isInit) {
        iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
    }
    if (downloadBtn && !isInit) {
        downloadBtn.href = `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    // 2. Manage active button states
    const bar = button.closest('.bs-tab-bar');
    if (!bar) return;
    
    const allBtns = bar.querySelectorAll('.bs-tab-btn');
    allBtns.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // 3. Move the pill
    const pill = bar.querySelector('.bs-tab-pill');
    if (pill) {
        const barRect = bar.getBoundingClientRect();
        const btnRect = button.getBoundingClientRect();
        pill.style.width = btnRect.width + 'px';
        pill.style.left = (btnRect.left - barRect.left) + 'px';
    }

    // 4. Scroll the active button into view if it's off-screen
    if (!isInit) {
        button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
};"""

js_content = re.sub(
    r'window\.switchPdf = function\(button, fileId\).*?};',
    new_switchPdf,
    js_content,
    flags=re.DOTALL
)

with open("script.js", "w", encoding="utf-8") as f:
    f.write(js_content)
print("Updated script.js")
