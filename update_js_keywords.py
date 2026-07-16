import os
import re

# 1. Update script.js
script_path = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\script.js"
with open(script_path, "r", encoding="utf-8") as f:
    script_content = f.read()

# Add to SPEC_KEYWORDS
keywords_insert = """
      'ENSTE': 'تكنولوجيا هندسة مناجم معادن صناعية عنابة enste',
      'ESGEE': 'هندسة كهربائية طاقوية وهران طاقات متجددة esgee',
      'ENSF': 'غابات طبيعة خنشلة aménagement forestier ensf',
      'biomedical': 'هندسة بيوطبية طب تكنولوجيا santé génie biomédical',
"""
# Find where to insert in SPEC_KEYWORDS
match = re.search(r"var SPEC_KEYWORDS = \{", script_content)
if match:
    insert_pos = match.end()
    script_content = script_content[:insert_pos] + keywords_insert + script_content[insert_pos:]
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(script_content)
    print("script.js updated.")

# 2. Update components/shared.js
shared_path = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\components\shared.js"
with open(shared_path, "r", encoding="utf-8") as f:
    shared_content = f.read()

# I notice that shared.js had objects like:
# { title: 'IGEE - معهد الإلكترونيك', desc: '...', url: '/university.html#IGEE', icon: 'fas fa-bolt', specialty: 'تكنولوجيا هندسة', keywords: ['IGEE', 'igee', 'هندسة كهربائية'] },
# I will append to UNIVERSITY SPECIALTIES section

shared_insert = """
          { title: 'ENSTE - عنابة', desc: 'المدرسة الوطنية العليا للتكنولوجيا والهندسة', url: '/university/speciality/enste', icon: 'fas fa-industry', specialty: 'تكنولوجيا و هندسة', keywords: ['ENSTE', 'enste', 'مناجم', 'معادن', 'صناعية'] },
          { title: 'ESGEE - وهران', desc: 'المدرسة العليا في الهندسة الكهربائية والطاقوية', url: '/university/speciality/esgee', icon: 'fas fa-plug', specialty: 'تكنولوجيا و هندسة', keywords: ['ESGEE', 'esgee', 'كهرباء', 'طاقة', 'متجددة'] },
          { title: 'ENSF - خنشلة', desc: 'المدرسة الوطنية العليا للغابات', url: '/university/speciality/ensf', icon: 'fas fa-tree', specialty: 'طبيعة', keywords: ['ENSF', 'ensf', 'غابات', 'طبيعة', 'خنشلة'] },
          { title: 'Biomedical - هندسة بيوطبية', desc: 'تخصص الهندسة البيوطبية', url: '/university/speciality/biomedical', icon: 'fas fa-heartbeat', specialty: 'تكنولوجيا و هندسة', keywords: ['Biomedical', 'biomedical', 'بيوطبية', 'طب', 'تكنولوجيا'] },
"""
# We can insert right after IGEE
match = re.search(r"\{ title: 'IGEE.*?\},", shared_content)
if match:
    insert_pos = match.end()
    shared_content = shared_content[:insert_pos] + "\n" + shared_insert + shared_content[insert_pos:]
    with open(shared_path, "w", encoding="utf-8") as f:
        f.write(shared_content)
    print("shared.js updated.")

