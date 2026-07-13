import os

file_path = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality\enste.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Instead of re-doing everything, let's just do a manual string replace on the divs to make them normal `detail-card` where appropriate.

content = content.replace(
    '<div class="detail-card large-card">\n    <h3><i class="fas fa-clipboard-check"></i> شروط التسجيل والقبول الأساسية</h3>',
    '<div class="detail-card">\n    <h3><i class="fas fa-clipboard-check"></i> شروط التسجيل والقبول الأساسية</h3>'
)

content = content.replace(
    '<div class="detail-card large-card">\n    <h3><i class="fas fa-chart-bar"></i> معايير وانتقاء التوجيه ومعدلات القبول (تحديث 2025)</h3>',
    '<div class="detail-card">\n    <h3><i class="fas fa-chart-bar"></i> معايير وانتقاء التوجيه ومعدلات القبول (تحديث 2025)</h3>'
)

content = content.replace(
    '<div class="detail-card large-card">\n    <h3><i class="fas fa-lightbulb"></i> خلاصة</h3>',
    '<div class="detail-card">\n    <h3><i class="fas fa-lightbulb"></i> خلاصة</h3>'
)

# And let's check information card length. It's a bit long, but let's make it standard if ESSA had the first as normal.
# ESSA had: detail-card large-card, detail-card, detail-card large-card, detail-card large-card, detail-card...
# Let's also make 'التخصصات المتاحة في الطور الثاني (عالم الاحتراف)' a normal detail-card if we want.
content = content.replace(
    '<div class="detail-card large-card">\n    <h3><i class="fas fa-cogs"></i> التخصصات المتاحة في الطور الثاني (عالم الاحتراف)</h3>',
    '<div class="detail-card">\n    <h3><i class="fas fa-cogs"></i> التخصصات المتاحة في الطور الثاني (عالم الاحتراف)</h3>'
)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed card classes in enste.html")
