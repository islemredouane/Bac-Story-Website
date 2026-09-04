import re

hub_files = {
    "resources/math/math.html":        "math",
    "resources/sci/math.html":         "sci",
    "resources/engineering/math.html": "engineering",
}

for fpath, stream in hub_files.items():
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    base_url = f"/resources/{stream}/math/moktasabat"

    # 1. Update main Moktasabat button
    # Match: <button class="main-btn" onclick="showSection('moktasabat-math')">
    content = re.sub(
        r'<button class="main-btn" onclick="showSection\(\'moktasabat-math\'\)">\s*<i class="fas fa-layer-group"></i> المكتسبات القبلية\s*</button>',
        f'<button class="main-btn" onclick="window.location.href=\'{base_url}\'">\n<i class="fas fa-layer-group"></i> المكتسبات القبلية\n                </button>',
        content,
        count=1
    )

    # 2. Remove inline moktasabat-math section
    # Match: <div class="resource-content" id="moktasabat-math"> ... </div>
    # Needs to match until the end of the btn-container and the closing div of the section.
    content = re.sub(
        r'</div><div class="resource-content" id="moktasabat-math">.*?</div>\s*</div>\s*</div>',
        r'</div>',
        content,
        flags=re.DOTALL
    )

    with open(fpath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated hub: {fpath}")

