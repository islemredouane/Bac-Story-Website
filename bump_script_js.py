import re
import glob

for filepath in glob.glob("resources/**/exercises.html", recursive=True):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Bump script.js version to v=9.0
    content = re.sub(r'script\.js\?v=[0-9.]+', 'script.js?v=9.0', content)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated script.js version in {filepath}")
