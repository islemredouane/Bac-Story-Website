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
// Use show2026() for subject buttons.
function show2026(id) {
    showSection(id);
    loadSectionIframe(id);
}

