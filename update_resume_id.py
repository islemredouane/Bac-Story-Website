import re

files_to_update = [
    "resources/math/math/moktasabat/resume.html",
    "resources/sci/math/moktasabat/resume.html",
    "resources/engineering/math/moktasabat/resume.html"
]

old_id = "1PouJ-kVnjMji67R3XmnE9tOHnQaVGSC5"
new_id = "1-R7E9yE7wlDEkAUJAYGcJ4Oi8DdmMLJm"

for filepath in files_to_update:
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        content = content.replace(old_id, new_id)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {filepath}")
    except Exception as e:
        print(f"Error updating {filepath}: {e}")
