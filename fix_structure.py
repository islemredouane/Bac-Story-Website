import os
import re

# 1. Read the good structure from ensf.html
ensf_path = r'c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality\ensf.html'
with open(ensf_path, 'r', encoding='utf-8') as f:
    ensf_content = f.read()

# We need the top part of ensf.html up to <div class="school-details" style="margin-top: 70px">\n<div class="details">
top_split = '<div class="school-details" style="margin-top: 70px">\n<div class="details">'
top_part = ensf_content.split(top_split)[0] + top_split

# We need the bottom part starting from the end of the details div
bottom_split = '</div>\n</div>\n</div>\n    <div id="footer-placeholder"></div>'
bottom_idx = ensf_content.find(bottom_split)
if bottom_idx == -1:
    # fallback search
    bottom_split = '</div>\n</div>\n</div>\n\n    <!-- ── Footer ── -->'
    bottom_idx = ensf_content.find(bottom_split)
    if bottom_idx == -1:
        bottom_idx = ensf_content.rfind('</div>', 0, ensf_content.find('<script'))
        # step back to close details, school-details, container, resource-content
        bottom_part = ensf_content[bottom_idx:]
    else:
        bottom_part = ensf_content[bottom_idx:]
else:
    bottom_part = ensf_content[bottom_idx:]


def fix_file(filepath, new_id, new_title, new_og_title, new_og_desc, new_og_image, details_content):
    # build the new content
    new_top = top_part.replace('id="ENSF"', f'id="{new_id}"')
    new_top = new_top.replace('المدرسة الوطنية العليا للغابات – ENSF خنشلة', new_title)
    new_top = re.sub(r'<title>.*?</title>', f'<title>{new_og_title} | BAC STORY</title>', new_top)
    new_top = re.sub(r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{new_og_title} | BAC STORY">', new_top)
    new_top = re.sub(r'<meta name="twitter:title" content=".*?">', f'<meta name="twitter:title" content="{new_og_title} | BAC STORY">', new_top)
    
    new_top = re.sub(r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{new_og_desc}">', new_top)
    new_top = re.sub(r'<meta name="twitter:description" content=".*?">', f'<meta name="twitter:description" content="{new_og_desc}">', new_top)
    new_top = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{new_og_desc}">', new_top)
    
    # Write the file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_top + '\n' + details_content + '\n' + bottom_part)
        print(f'{filepath} fixed.')

# Extract details from biomedical
biomed_path = r'c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality\biomedical.html'
with open(biomed_path, 'r', encoding='utf-8') as f:
    biomed_content = f.read()
b_start = biomed_content.find('<div class="details">') + len('<div class="details">')
b_end = biomed_content.find('</div>\n        </div>\n\n        <!-- Specialty Navigation Buttons -->')
if b_end == -1: b_end = biomed_content.find('</div>\n</div>\n</div>\n\n    <!-- Specialty Navigation Buttons -->')
if b_end == -1: b_end = biomed_content.find('</div>\n            </div>\n        </div>\n\n        <!-- Specialty Navigation Buttons -->')
if b_end == -1: b_end = biomed_content.find('</div>\n            </div>\n        </div>')

biomed_details = biomed_content[b_start:b_end].strip()
if biomed_details.endswith('</div>\n            </div>'):
    biomed_details = biomed_details[:-len('</div>\n            </div>')].strip()
elif biomed_details.endswith('</div>\n        </div>'):
    biomed_details = biomed_details[:-len('</div>\n        </div>')].strip()

biomed_desc = "تعرف على تخصص الهندسة البيوطبية - Génie Biomédical في الجزائر لعام 2026. اكتشف معدلات القبول المطلوبة، شروط التسجيل، المناهج الدراسية، وآفاق فرص العمل ومستقبل التخصص في سوق العمل الجزائري."
fix_file(biomed_path, "biomedical", "تخصص الهندسة البيوطبية - Génie Biomédical", "تخصص الهندسة البيوطبية - Génie Biomédical", biomed_desc, "https://bacstory.vercel.app/images/og-banner.png", biomed_details)

# Extract details from esesm
esesm_path = r'c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality\esesm.html'
with open(esesm_path, 'r', encoding='utf-8') as f:
    esesm_content = f.read()
e_start = esesm_content.find('<div class="details">') + len('<div class="details">')
e_end = esesm_content.find('</div>\n        </div>\n\n        <!-- Specialty Navigation Buttons -->')
if e_end == -1: e_end = esesm_content.find('</div>\n            </div>\n        </div>\n\n        <!-- Specialty Navigation Buttons -->')
if e_end == -1: e_end = esesm_content.find('</div>\n            </div>\n        </div>')

esesm_details = esesm_content[e_start:e_end].strip()
if esesm_details.endswith('</div>\n            </div>'):
    esesm_details = esesm_details[:-len('</div>\n            </div>')].strip()
elif esesm_details.endswith('</div>\n        </div>'):
    esesm_details = esesm_details[:-len('</div>\n        </div>')].strip()

esesm_desc = "تعرف على المدرسة العليا لأساتذة الصم والبكم - ESESM بني مسوس في الجزائر لعام 2026. اكتشف معدلات القبول المطلوبة، شروط التسجيل، المناهج الدراسية، وآفاق فرص العمل ومستقبل التخصص في سوق العمل الجزائري."
fix_file(esesm_path, "esesm", "المدرسة العليا لأساتذة الصم والبكم - ESESM بني مسوس", "المدرسة العليا لأساتذة الصم والبكم - ESESM بني مسوس", esesm_desc, "https://bacstory.vercel.app/images/og-banner.png", esesm_details)

