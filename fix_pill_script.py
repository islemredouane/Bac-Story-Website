import re
import glob

# 1. Update script.js
with open("script.js", "r", encoding="utf-8") as f:
    js_content = f.read()

# Replace the pill logic
old_pill_logic = """
    const pill = bar.querySelector('.pdf-switcher-pill');
    if (pill) {
        const barRect = bar.getBoundingClientRect();
        const btnRect = button.getBoundingClientRect();
        pill.style.width = btnRect.width + 'px';
        pill.style.left = (btnRect.left - barRect.left) + 'px';
    }
"""

new_pill_logic = """
    const pill = bar.querySelector('.pdf-switcher-pill');
    if (pill) {
        // Use offsetLeft to correctly position the pill regardless of scroll position
        pill.style.width = button.offsetWidth + 'px';
        pill.style.left = button.offsetLeft + 'px';
    }
"""

js_content = js_content.replace(old_pill_logic.strip(), new_pill_logic.strip())

with open("script.js", "w", encoding="utf-8") as f:
    f.write(js_content)
print("Updated script.js pill offset logic")

# 2. Bump script.js version to bypass cache
for filepath in glob.glob("resources/**/exercises.html", recursive=True):
    with open(filepath, "r", encoding="utf-8") as f:
        html = f.read()
    
    html = re.sub(r'script\.js\?v=[0-9.]+', 'script.js?v=9.1', html)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Bumped script.js version in {filepath}")
