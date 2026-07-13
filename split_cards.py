import os

file_path = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality\enste.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the الهدرة من الداخل block
old_feedback = """<div class="detail-card large-card">
    <h3><i class="fas fa-comments"></i> الهدرة من الداخل: آراء وتجارب الطلبة</h3>
    <p>باه تعرف حقيقة القراية تما قبل ما يسجل، هاهي تجارب الطلبة لي راهم في الميدان حالياً:</p>
    
    <h4 style="margin-top: 15px; color: #2ecc71;">😍 الجوانب الإيجابية (علاش تعجبهم؟)</h4>
    <ul>
        <li>🟢 <strong>التماسك بعد الاندماج:</strong> الاندماج تاع 2022 جاب قوة بيداغوجية كبيرة؛ مخابر مدرسة المناجم القديمة مع تكنولوجيا مدرسة الصناعة شكلوا ثروة علمية وتطبيقية ممتازة للطلبة.</li>
        <li>🟢 <strong>القرب من الميدان الصناعي:</strong> الخرجات الميدانية والتربصات متوفرة بكثرة وسهلة بفضل شبكة العلاقات القوية للمدرسة مع المصانع المحيطة بها.</li>
        <li>🟢 <strong>البيئة النخبوية:</strong> تدرس في جو بيداغوجي محترم، أعداد الطلبة مدروسة، والأساتذة متوفرون دائماً للتأطير.</li>
    </ul>

    <h4 style="margin-top: 15px; color: #e74c3c;">😅 الجوانب الصعبة (واش يشتكوا؟)</h4>
    <ul>
        <li>🔴 <strong>ضغط "البريبا" والريتم السريع:</strong> القراية قاصحة في العامين الأولى وتتطلب حضوراً يومياً وانضباطاً صارماً (الغيابات تقدر تقصيك).</li>
        <li>🔴 <strong>الموقع والنقل:</strong> رغم أن القطب الجامعي بسيدي عمار مجهز، إلا أن بعض الطلبة يجدون صعوبة في النقل أو يفضلون حركية وسط المدينة.</li>
    </ul>
</div>"""

new_feedback = """<div class="detail-card">
    <h3><i class="fas fa-thumbs-up"></i> الجوانب الإيجابية (آراء الطلبة)</h3>
    <ul>
        <li>🟢 <strong>التماسك بعد الاندماج:</strong> الاندماج تاع 2022 جاب قوة بيداغوجية كبيرة؛ مخابر مدرسة المناجم القديمة مع تكنولوجيا مدرسة الصناعة شكلوا ثروة علمية وتطبيقية ممتازة للطلبة.</li>
        <li>🟢 <strong>القرب من الميدان الصناعي:</strong> الخرجات الميدانية والتربصات متوفرة بكثرة وسهلة بفضل شبكة العلاقات القوية للمدرسة مع المصانع المحيطة بها.</li>
        <li>🟢 <strong>البيئة النخبوية:</strong> تدرس في جو بيداغوجي محترم، أعداد الطلبة مدروسة، والأساتذة متوفرون دائماً للتأطير.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-exclamation-circle"></i> الجوانب الصعبة (آراء الطلبة)</h3>
    <ul>
        <li>🔴 <strong>ضغط "البريبا" والريتم السريع:</strong> القراية قاصحة في العامين الأولى وتتطلب حضوراً يومياً وانضباطاً صارماً (الغيابات تقدر تقصيك).</li>
        <li>🔴 <strong>الموقع والنقل:</strong> رغم أن القطب الجامعي بسيدي عمار مجهز، إلا أن بعض الطلبة يجدون صعوبة في النقل أو يفضلون حركية وسط المدينة.</li>
    </ul>
</div>"""

# Replace the المميزات والعيوب block
old_pros_cons = """<div class="detail-card large-card">
    <h3><i class="fas fa-balance-scale"></i> المميزات والعيوب (الملخص المفيد)</h3>
    <h4 style="margin-top: 15px; color: #2ecc71;">المميزات:</h4>
    <ul>
        <li>✅ تخرج بلقب مهندس دولة معترف به وطنياً ودولياً + ماستر 2.</li>
        <li>✅ تخصصات حصرية وقوية جداً تضمن لك عملاً سريعاً بعد التخرج.</li>
        <li>✅ تكوين تطبيقي عالي المستوى وستاجات دورية في كبريات الشركات.</li>
    </ul>
    <h4 style="margin-top: 15px; color: #e74c3c;">العيوب:</h4>
    <ul>
        <li>❌ نظام دراسي مغلق ومكثف يسبب ضغطاً مستمراً طوال السنتين الأولى.</li>
        <li>❌ هاجس المسابقة الوطنية (الكونكور) كباقي المدارس العليا.</li>
    </ul>
</div>"""

new_pros_cons = """<div class="detail-card">
    <h3><i class="fas fa-check-circle"></i> المميزات (الملخص المفيد)</h3>
    <ul>
        <li>✅ تخرج بلقب مهندس دولة معترف به وطنياً ودولياً + ماستر 2.</li>
        <li>✅ تخصصات حصرية وقوية جداً تضمن لك عملاً سريعاً بعد التخرج.</li>
        <li>✅ تكوين تطبيقي عالي المستوى وستاجات دورية في كبريات الشركات.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-times-circle"></i> العيوب (الملخص المفيد)</h3>
    <ul>
        <li>❌ نظام دراسي مغلق ومكثف يسبب ضغطاً مستمراً طوال السنتين الأولى.</li>
        <li>❌ هاجس المسابقة الوطنية (الكونكور) كباقي المدارس العليا.</li>
    </ul>
</div>"""

if old_feedback in content:
    content = content.replace(old_feedback, new_feedback)
else:
    print("Could not find old feedback block.")

if old_pros_cons in content:
    content = content.replace(old_pros_cons, new_pros_cons)
else:
    print("Could not find old pros cons block.")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Split cards successfully!")
