import fitz, os, sys

PDF = r"C:\Users\AZ\Downloads\Circulaire_07-07-2026-signed.pdf"
OUT = r"C:\Users\AZ\AppData\Local\Temp\claude\C--Users-AZ-Documents-BAC-CHANNEL-Bac-Story-Website--claude-worktrees-cool-stonebraker-deb446\20380bb3-e16d-4c66-97bb-c3b548cb9248\scratchpad"

doc = fitz.open(PDF)

# 1. full text cache
with open(os.path.join(OUT, "text-cache.txt"), "w", encoding="utf-8") as f:
    for i, page in enumerate(doc):
        f.write(f"\n===== PAGE {i+1} (0-based {i}) =====\n")
        f.write(page.get_text())
print("text cache done,", len(doc), "pages")

# 2. render front pages 1-16
pages_dir = os.path.join(OUT, "pages")
os.makedirs(pages_dir, exist_ok=True)
for i in range(0, 16):
    pix = doc[i].get_pixmap(dpi=150)
    pix.save(os.path.join(pages_dir, f"p{i+1:03d}.png"))
print("rendered pages 1-16")
