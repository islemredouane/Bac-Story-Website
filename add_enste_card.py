import os

file_path = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\specialities.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# We need to find the ESSA card end to insert the ENSTE card right after it
# Or simply append it after the ESSA card.
essa_str = """<div class="spec-card" data-category="engineering" data-name="ESSA"""
essa_idx = content.find(essa_str)

if essa_idx != -1:
    # Find the end of this spec-card
    # A spec-card usually ends with </div>\n  </div>\n  </div>
    # Let's just find the next spec-card
    next_card_idx = content.find('<div class="spec-card"', essa_idx + 10)
    
    if next_card_idx != -1:
        enste_card = """
  <div class="spec-card" data-category="engineering" data-name="ENSTE عنابة المدرسة الوطنية العليا للتكنولوجيا والهندسة" 
onclick="window.location.href='/university/speciality/enste'">
  <div class="spec-card-img"><img alt="ENSTE" loading="lazy" src="/images/ENSTE.png"/></div>
  <div class="spec-card-body">
  <div class="spec-card-top">
  <div class="spec-card-name">المدرسة الوطنية العليا للتكنولوجيا والهندسة - ENSTE</div>
  </div>
  <div class="spec-card-footer">
  <span class="cat-badge cat-badge--engineering">هندسة</span>
  </div>
  </div>
  </div>
"""
        updated_content = content[:next_card_idx] + enste_card + content[next_card_idx:]
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(updated_content)
        print("Successfully added ENSTE card to specialities.html")
    else:
        print("Could not find next card.")
else:
    print("Could not find ESSA card.")
