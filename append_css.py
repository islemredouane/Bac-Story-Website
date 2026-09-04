with open("style.css", "a", encoding="utf-8") as f:
    f.write("""
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
""")
print("Appended CSS to style.css")

# Bump the cache version in the exercises pages so the new css loads
import glob
for file in glob.glob("resources/**/moktasabat/exercises.html", recursive=True):
    with open(file, "r", encoding="utf-8") as f:
        html = f.read()
    # Find <link rel="stylesheet" href="/style.css?v=..."> and replace with ?v=10.16
    import re
    html = re.sub(r'href="/style\.css\?v=[0-9.]+"', 'href="/style.css?v=10.16"', html)
    with open(file, "w", encoding="utf-8") as f:
        f.write(html)
    print("Bumped version in", file)
