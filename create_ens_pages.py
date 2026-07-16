import os
import re

base_dir = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality"
ens_path = os.path.join(base_dir, "ens.html")

with open(ens_path, 'r', encoding='utf-8') as f:
    ens_text = f.read()

# Extract header and footer from ens.html
# Header ends before <div style="margin-top: 60px;"> which starts the new grid.
# Wait, let's just find the start of the grid.
grid_start = ens_text.find('<div style="margin-top: 60px;">\n    <h2>تخصصات المدارس العليا للأساتذة</h2>')
# But wait, we want the title and metadata to be customized later maybe, but for now we can just use ens.html's header.
header = ens_text[:grid_start]

# Footer starts from <div id="global-cta-placeholder"></div>
footer_start = ens_text.find('<div id="global-cta-placeholder"></div>')
footer = ens_text[footer_start:]

with open("extracted_ens.html", 'r', encoding='utf-8') as f:
    extracted_text = f.read()

parts = extracted_text.split('<div class="detail-card large-card">')
# parts[0] is empty or whitespace
parts = [p.strip() for p in parts if p.strip()]

filenames = ["ens-francais.html", "ens-anglais.html", "ens-tamazight.html", "ens-sport.html"]
titles = [
    "أستاذ التعليم الابتدائي في اللغة الفرنسية",
    "أستاذ التعليم الابتدائي في اللغة الإنجليزية",
    "أستاذ التعليم الابتدائي في اللغة الأمازيغية",
    "أستاذ التعليم الابتدائي في التربية البدنية"
]

for i, p in enumerate(parts):
    content = '<div class="detail-card large-card">\n    ' + p
    
    # Replace the title in the header
    new_header = re.sub(r'<title>.*?</title>', f'<title>{titles[i]} - ENS | BAC STORY</title>', header)
    
    html = new_header + content + '\n\n' + footer
    
    out_path = os.path.join(base_dir, filenames[i])
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)
        
print("Successfully generated 4 individual HTML files.")
