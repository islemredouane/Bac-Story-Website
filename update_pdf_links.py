import re

files_to_update = [
    "resources/math/math/moktasabat/exercises.html",
    "resources/sci/math/moktasabat/exercises.html",
    "resources/engineering/math/moktasabat/exercises.html"
]

files_data = [
    {"label": "تمارين المكتسبات", "id": "1YUg7C01h4rfcMx4WU6Ew_ImvXTafKhu5"},
    {"label": "النهايات 1", "id": "1lJlYw9cqDY_8VcYSyikUyJCOtoq3F8dD"},
    {"label": "النهايات 2", "id": "1JFChBeY8-JDbvCwMOTs0NX0nPU9unwqa"},
    {"label": "الإشتقاقية", "id": "1y34Qz5jEdf10jMxE0YNQhu2i7eS4FM5k"},
    {"label": "القراءة البيانية", "id": "1T7ANeq3gFck_g1ORHdEWL8wUil0FO_sy"},
]

switcher_html = '                        <div class="pdf-switcher-toggle" id="pdfTabBar">\n'
switcher_html += '                            <span class="pdf-switcher-pill" id="pdfTabPill"></span>\n'
for i, f in enumerate(files_data):
    active_cls = ' active' if i == 0 else ''
    switcher_html += f'                            <button class="pdf-switcher-tab{active_cls}" onclick="switchPdf(this, \'{f["id"]}\')"><i class="fas fa-file-pdf"></i> {f["label"]}</button>\n'
switcher_html += '                        </div>'

first_file_id = files_data[0]["id"]

for filepath in files_to_update:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace the switcher block
    content = re.sub(
        r'<div class="pdf-switcher-toggle" id="pdfTabBar">.*?</div>',
        switcher_html,
        content,
        flags=re.DOTALL
    )

    # Replace iframe initial source
    content = re.sub(
        r'<iframe src="https://drive\.google\.com/file/d/[^/]+/preview"',
        f'<iframe src="https://drive.google.com/file/d/{first_file_id}/preview"',
        content
    )

    # Replace download button initial id
    content = re.sub(
        r'href="https://drive\.google\.com/uc\?export=download&amp;id=[^"]+"',
        f'href="https://drive.google.com/uc?export=download&id={first_file_id}"',
        content
    )
    # Just in case it's not encoded
    content = re.sub(
        r'href="https://drive\.google\.com/uc\?export=download&id=[^"]+"',
        f'href="https://drive.google.com/uc?export=download&id={first_file_id}"',
        content
    )

    # Replace script init
    content = re.sub(
        r"switchPdf\(activeBtn, '[^']+', true\)",
        f"switchPdf(activeBtn, '{first_file_id}', true)",
        content
    )

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"Updated {filepath}")
