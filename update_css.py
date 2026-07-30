import os

file_path = "style.css"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

new_styles = """
.gcta-card--plans {
    background: linear-gradient(135deg, #0d5c75 0%, #17a2b8 50%, #00d2ff 100%);
    box-shadow: 0 8px 28px rgba(23, 162, 184, 0.15);
}

.gcta-card--resources {
    background: linear-gradient(135deg, #750d4d 0%, #b81775 50%, #ff007f 100%);
    box-shadow: 0 8px 28px rgba(184, 23, 117, 0.15);
}

.gcta-card--oqba {
    background: linear-gradient(135deg, #0d753b 0%, #17b85c 50%, #00ff73 100%);
    box-shadow: 0 8px 28px rgba(23, 184, 92, 0.15);
}
"""

target = ".gcta-card--correct {"
idx = content.find(target)
if idx != -1:
    end_of_block = content.find("}", idx) + 1
    content = content[:end_of_block] + "\n" + new_styles + content[end_of_block:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated style.css")
