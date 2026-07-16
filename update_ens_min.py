import os
import re
import glob

# Paths
spec_dir = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality"
files = glob.glob(os.path.join(spec_dir, "ens-*.html"))

# Regex to match the min average line
# Examples: <li><b>⚠️ معدل الترشح الأدنى:</b> لا يقل عن 14.00/20 كمعدل عام للمشاركة في الفرز التنازلي.</li>
# Or 13.00/20 etc.
pattern = re.compile(r'<li><b>⚠️ معدل الترشح الأدنى:</b> لا يقل عن \d+\.\d+/20 كمعدل عام للمشاركة في الفرز التنازلي\.</li>')

updated_count = 0

for file in files:
    filename = os.path.basename(file)
    if filename == "ens.html":
        continue
    
    # Determine level
    new_min = None
    if "-primaire" in filename:
        new_min = "11.00"
    elif "-moyen" in filename:
        new_min = "12.00"
    elif "-lycee" in filename:
        new_min = "13.00"
    
    if not new_min:
        continue
        
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Check if the new law is already there
    if "قرار وزاري جديد" in content or "إلغاء شرط الحصول على معدل 13/20" in content:
        # Avoid duplicate appending if we run the script multiple times
        # But we still might need to update the min score
        replacement = f"<li><b>⚠️ معدل الترشح الأدنى:</b> لا يقل عن {new_min}/20 كمعدل عام للمشاركة في الفرز التنازلي.</li>"
        # We need to replace the line that contains the minimum, avoiding touching the law line if it's already there
        content = re.sub(r'<li><b>⚠️ معدل الترشح الأدنى:</b> لا يقل عن \d+\.\d+/20 كمعدل عام للمشاركة في الفرز التنازلي\.</li>', replacement, content)
    else:
        replacement = f"<li><b>⚠️ معدل الترشح الأدنى:</b> لا يقل عن {new_min}/20 كمعدل عام للمشاركة في الفرز التنازلي.</li>\n        <li><b>✅ قرار وزاري جديد 2025:</b> إلغاء شرط الحصول على معدل 13/20 في المادة الأساسية، وهو الشرط الذي كان معمولًا به سابقًا.</li>"
        content = pattern.sub(replacement, content)
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    updated_count += 1

print(f"Updated {updated_count} files.")
