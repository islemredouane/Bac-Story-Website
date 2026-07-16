import os
import re

base_dir = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality"
filenames = ["ens-francais.html", "ens-anglais.html", "ens-tamazight.html", "ens-sport.html"]

with open("extracted_ens.html", 'r', encoding='utf-8') as f:
    extracted_text = f.read()

parts = extracted_text.split('<div class="detail-card large-card">')
parts = [p.strip() for p in parts if p.strip()]

for i, fname in enumerate(filenames):
    path = os.path.join(base_dir, fname)
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    # 1. Get header: everything before the FIRST <div class="detail-card"> or <div class="detail-card large-card"> inside <div class="details">
    details_start_str = '<div class="school-details">\n<div class="details">'
    details_start_idx = text.find(details_start_str)
    if details_start_idx == -1:
        continue
    
    header = text[:details_start_idx + len(details_start_str)] + '\n'
    
    # 2. Get the specific card from `parts`
    specific_card = '<div class="detail-card large-card">\n    ' + parts[i] + '\n'
    
    # 3. Get footer: everything from </div>\n</div>\n</div>\n<div id="global-cta-placeholder"></div> onwards
    footer_idx = text.find('<div id="global-cta-placeholder"></div>')
    
    # We need to close the <div class="details">, <div class="school-details">, <div class="container">, <div class="resource-content">
    # Looking at ens.html:
    # </div> <!-- details -->
    # </div> <!-- school-details -->
    # </div> <!-- container -->
    # </div> <!-- resource-content -->
    # Then <div id="global-cta-placeholder"></div>
    # Let's just grab from footer_idx onwards, and prepend the closing divs.
    
    footer = '\n</div>\n</div>\n</div>\n</div>\n' + text[footer_idx:]
    
    new_html = header + specific_card + footer
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_html)

print("Successfully fixed the 4 files.")
