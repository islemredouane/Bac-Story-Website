import os

CSS_CODE = """
/* ==========================================================================
   Premium PDF Switcher Bar (Moktasabat & Multi-file views)
   ========================================================================== */
.pdf-switcher-container {
    width: 100%;
    max-width: 900px;
    margin: 0 auto 1.5rem auto;
    padding: 0 10px;
}

.pdf-switcher-bar {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 10px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
    -webkit-overflow-scrolling: touch;
}

.pdf-switcher-bar::-webkit-scrollbar {
    height: 6px;
}
.pdf-switcher-bar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
}
.pdf-switcher-bar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
}

.pdf-switcher-btn {
    flex: 0 0 auto;
    padding: 10px 20px;
    border-radius: 30px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
    font-family: 'Tajawal', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.pdf-switcher-btn i {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    transition: color 0.3s ease;
}

.pdf-switcher-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    color: #fff;
}

.pdf-switcher-btn:hover i {
    color: rgba(255, 255, 255, 0.9);
}

.pdf-switcher-btn.active {
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    border-color: rgba(255, 255, 255, 0.3);
    color: #fff;
    font-weight: 700;
    box-shadow: 0 8px 15px rgba(30, 60, 114, 0.4), inset 0 1px 0 rgba(255,255,255,0.2);
}

.pdf-switcher-btn.active i {
    color: #fff;
}
"""

JS_CODE = """
/* ==========================================================================
   Premium PDF Switcher (for individual pages with multiple files)
   ========================================================================== */
window.switchPdf = function(button, fileId) {
    // 1. Update the iframe source
    const iframe = document.querySelector('.responsive-pdf');
    const downloadBtn = document.querySelector('.down-btn');
    
    if (iframe) {
        iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
    }
    if (downloadBtn) {
        downloadBtn.href = `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    // 2. Manage active button states
    const allBtns = document.querySelectorAll('.pdf-switcher-btn');
    allBtns.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // 3. Scroll the active button into view if it's off-screen (useful for mobile)
    button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
};
"""

with open("style.css", "a", encoding="utf-8") as f:
    f.write(CSS_CODE)
print("Updated style.css")

with open("script.js", "a", encoding="utf-8") as f:
    f.write(JS_CODE)
print("Updated script.js")
