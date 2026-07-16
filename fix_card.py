import os
import re

spec_path = r'c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\specialities.html'
with open(spec_path, 'r', encoding='utf-8') as f: 
    content = f.read()

# 1. Find and extract the card
# The card might have data-category="ens" or "education" by now, but let's find it by "ESESM"
card_start = content.find('<div class="spec-card" data-category="ens" data-name="أساتذة الصم والبكم ESESM"')
if card_start == -1:
    card_start = content.find('<div class="spec-card" data-category="education" data-name="أساتذة الصم والبكم ESESM"')

if card_start != -1:
    # find the end of this card
    # A spec-card has <div class="spec-card"> ... </div></div></div>
    # let's just find the next <div class="spec-card" or <div class="spec-empty-state" or </div>\n  <div id="global-cta-placeholder">
    card_end = content.find('<div id="global-cta-placeholder">', card_start)
    if card_end != -1:
        # Actually it's right before </div>\n  <div id="global-cta-placeholder">
        card_end = content.rfind('</div>', card_start, card_end)
        card_end = content.find('>', card_end) + 1

    card_html = content[card_start:card_end]
    
    # 2. Remove it from current location
    content = content[:card_start] + content[card_end:]
    
    # 3. Update the category to education
    card_html = card_html.replace('data-category="ens"', 'data-category="education"')
    card_html = card_html.replace('cat-badge--ens', 'cat-badge--education')
    
    # 4. Find where to insert it: right before <div class="spec-empty-state" id="spec-empty-state">
    insert_pos = content.find('<div class="spec-empty-state" id="spec-empty-state">')
    if insert_pos != -1:
        content = content[:insert_pos] + card_html + '\n  ' + content[insert_pos:]
        with open(spec_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print('Card fixed and moved.')
    else:
        print('Could not find spec-empty-state')
else:
    print('Could not find the ESESM card to move.')
