// ─── BAC 2026 — Lazy iframe loading ──────────────────────────────────────────
// Iframes use data-src instead of src. Load only when section becomes active.
function loadSectionIframe(id) {
    var section = document.getElementById(id);
    if (!section) return;
    var iframe = section.querySelector('iframe[data-src]');
    if (iframe) {
        iframe.src = iframe.getAttribute('data-src');
        iframe.removeAttribute('data-src');
    }
}

// Handle direct URL hash on load + popstate (back/forward button)
document.addEventListener('DOMContentLoaded', function () {
    var id = location.hash.slice(1);
    if (id) loadSectionIframe(id);
});
window.addEventListener('popstate', function (e) {
    var id = (e.state && e.state.section) || location.hash.slice(1);
    if (id) loadSectionIframe(id);
});

// ─── BAC 2026 — Availability Guard ───────────────────────────────────────────
// Use show2026() for subject buttons. Checks data-available before navigating.
function show2026(id) {
    var el = document.getElementById(id);
    if (el && el.getAttribute('data-available') === 'false') {
        showToast('الملف غير متاح حالياً، سيتم إضافته فور صدوره رسمياً ⏳');
        return;
    }
    showSection(id);
    loadSectionIframe(id);
}

// ─── BAC 2026 — Toast Notification ───────────────────────────────────────────
function showToast(message) {
    const existing = document.getElementById('bac-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'bac-toast';
    Object.assign(toast.style, {
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%) translateY(-20px)',
        background: 'linear-gradient(135deg, #1a3a8f 0%, #2c5cc5 55%, #3d6ee0 100%)',
        color: '#fff',
        padding: '14px 22px',
        borderRadius: '14px',
        fontSize: '0.97rem',
        fontFamily: "'Tajawal', sans-serif",
        fontWeight: '600',
        lineHeight: '1.5',
        zIndex: '999999',
        boxShadow: '0 8px 30px rgba(44, 92, 195, 0.45), 0 2px 8px rgba(0,0,0,0.25)',
        border: '1.5px solid rgba(255,255,255,0.15)',
        transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        opacity: '0',
        pointerEvents: 'none',
        textAlign: 'center',
        direction: 'rtl',
        maxWidth: '320px',
        width: 'calc(100% - 40px)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        justifyContent: 'center'
    });

    toast.innerHTML = `<i class="fas fa-clock" style="color:#ff6b35;font-size:1.1rem;flex-shrink:0;"></i><span>${message}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-10px)';
        setTimeout(() => toast.remove(), 350);
    }, 3200);
}
