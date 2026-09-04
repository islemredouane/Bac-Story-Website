import os
import re

TODAY = "2026-09-04"

STREAM_INFO = {
    "math":        {"ar": "شعبة الرياضيات",       "en": "Mathematics"},
    "sci":         {"ar": "شعبة العلوم التجريبية", "en": "Experimental Sciences"},
    "engineering": {"ar": "شعبة الهندسة",          "en": "Engineering"},
}

PLACEHOLDER_ID = "1PouJ-kVnjMji67R3XmnE9tOHnQaVGSC5" # Random ID for testing

def make_head(title, desc, canonical, breadcrumbs, stream):
    stream_ar = STREAM_INFO[stream]["ar"]
    bc_json = ",\n        ".join(
        f'{{"@type":"ListItem","position":{i+1},"name":"{n}","item":"https://www.bac-story.com{u}"}}'
        for i, (n, u) in enumerate(breadcrumbs)
    )
    return f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | BAC STORY</title>
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){{w[l]=w[l]||[];w[l].push({{'gtm.start':
    new Date().getTime(),event:'gtm.js'}});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    }})(window,document,'script','dataLayer','GTM-T5H3TNJ4');</script>
    <!-- End Google Tag Manager -->
    <meta name="description" content="{desc}">
    <meta name="author" content="redouane mohamed islem">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://www.bac-story.com{canonical}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="{title} | BAC STORY">
    <meta property="og:description" content="{desc}">
    <meta property="og:image" content="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/og-banner.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="https://www.bac-story.com{canonical}">
    <meta property="og:locale" content="ar_DZ">
    <meta property="og:site_name" content="BAC STORY">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title} | BAC STORY">
    <meta name="twitter:description" content="{desc}">
    <meta name="twitter:image" content="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/og-banner.png">
    <script type="application/ld+json">
    {{"@context":"https://schema.org","@graph":[
    {{"@type":"WebPage","name":"{title}","description":"{desc}","url":"https://www.bac-story.com{canonical}","inLanguage":"ar",
    "publisher":{{"@type":"EducationalOrganization","name":"BAC STORY","url":"https://www.bac-story.com"}},
    "breadcrumb":{{"@type":"BreadcrumbList","itemListElement":[{bc_json}]}}}},
    {{"@type":"LearningResource","name":"{title}","description":"{desc}",
    "url":"https://www.bac-story.com{canonical}","educationalLevel":"بكالوريا — ثالثة ثانوي",
    "learningResourceType":"ملف دراسي","inLanguage":"ar",
    "about":{{"@type":"Thing","name":"الرياضيات"}},
    "audience":{{"@type":"EducationalAudience","educationalRole":"student"}},
    "provider":{{"@type":"EducationalOrganization","name":"BAC STORY","url":"https://www.bac-story.com"}}}}
    ]}}
    </script>
    <link rel="icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#1a3a8f">
    <link rel="dns-prefetch" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    <link rel="stylesheet" href="/style.css?v=10.15">
    <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/fontawesome.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/solid.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/brands.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/fontawesome.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/solid.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/brands.min.css">
    </noscript>
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&family=Pattaya&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&family=Pattaya&display=swap"></noscript>
</head>"""


# ── Hub Page ───────────────────────────────────────────────────────────
def make_hub_page(title, desc, canonical, back_url, back_label, breadcrumbs, stream, base_url):
    head = make_head(title, desc, canonical, breadcrumbs, stream)
    return head + f"""
<body>
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T5H3TNJ4" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <div id="navbar-placeholder"></div>
    <div class="resource-content active">
        <div class="container">
            <div class="ad-card-inject"></div>
            <h1 class="visually-hidden">{title}</h1>
            <div class="modern-section-header">
                <h2>{title}</h2>
            </div>
            <div class="btn-container">
                <button class="main-btn" onclick="window.location.href='{base_url}/resume'">
                    <i class="fas fa-edit"></i> الملخص
                </button>
                <button class="main-btn" onclick="window.location.href='{base_url}/exercises'">
                    <i class="fas fa-file-pen"></i> سلاسل التمارين
                </button>
            </div>
            <div style="text-align:center;margin-top:1.5rem;">
                <a href="{back_url}" class="modern-cta-btn"><i class="fas fa-arrow-right"></i> العودة لـ {back_label}</a>
            </div>
        </div>
    </div>
    <div id="global-cta-placeholder"></div>
    <div id="footer-placeholder"></div>
    <script src="/ads-config.js?v=1.12"></script>
    <script src="/components/shared.js?v=9.34"></script>
    <script src="/script.js?v=8.7"></script>
    <!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{{"token": "6153c3a6dd54435780cd9d84f9f958f8"}}'></script><!-- End Cloudflare Web Analytics -->
</body>
</html>"""


# ── Regular PDF Page (Resume) ────────────────────────────────────────────────
def make_resume_page(title, desc, canonical, back_url, back_label, breadcrumbs, stream):
    head = make_head(title, desc, canonical, breadcrumbs, stream)
    return head + f"""
<body>
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T5H3TNJ4" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <div id="navbar-placeholder"></div>
    <div class="resource-content active">
        <div class="container">
            <div class="ad-card-inject"></div>
            <h1 class="visually-hidden">{title}</h1>
            <div class="modern-section-header">
                <h2>{title}</h2>
            </div>
            <section class="pdf-viewer" style="text-align:center;padding-bottom:40px;">
                <div class="pdf-wrapper">
                    <a href="https://t.me/islembacdz" target="_blank" rel="noopener" style="margin-bottom:40px;" class="search-telegram-btn">
                        <i class="fab fa-telegram-plane"></i>
                        <span>انضم إلينا على التلغرام</span>
                    </a>
                    <!-- Placeholder ID until user provides the real one -->
                    <iframe src="https://drive.google.com/file/d/{PLACEHOLDER_ID}/preview"
                        class="responsive-pdf" loading="lazy" allowfullscreen></iframe>
                    <div class="pdf-buttons">
                        <button onclick="toggleFullScreen(event)" class="full-btn" style="flex:1;border:none;font-size:16px;font-weight:500;cursor:pointer;">
                            <i class="fa-solid fa-expand"></i> تكبير الملف
                        </button>
                        <a href="https://drive.google.com/uc?export=download&id={PLACEHOLDER_ID}" download class="down-btn"
                            style="flex:1;text-decoration:none;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:500;">
                            <i class="fa-solid fa-download"></i> تحميل الملف
                        </a>
                    </div>
                </div>
            </section>
            <div style="text-align:center;margin-top:1.5rem;">
                <a href="{back_url}" class="modern-cta-btn"><i class="fas fa-arrow-right"></i> العودة لـ {back_label}</a>
            </div>
        </div>
    </div>
    <div id="global-cta-placeholder"></div>
    <div id="footer-placeholder"></div>
    <script src="/ads-config.js?v=1.12"></script>
    <script src="/components/shared.js?v=9.34"></script>
    <script src="/script.js?v=8.7"></script>
    <!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{{"token": "6153c3a6dd54435780cd9d84f9f958f8"}}'></script><!-- End Cloudflare Web Analytics -->
</body>
</html>"""


# ── Switcher PDF Page (Exercises) ─────────────────────────────────────────────
def make_exercises_page(title, desc, canonical, back_url, back_label, breadcrumbs, stream):
    head = make_head(title, desc, canonical, breadcrumbs, stream)
    # Provide placeholders for now
    files = [
        {"id": "FILE_ID_1", "label": "السلسلة 1"},
        {"id": "FILE_ID_2", "label": "السلسلة 2"},
        {"id": "FILE_ID_3", "label": "الحلول"},
    ]
    
    switcher_html = ""
    for i, f in enumerate(files):
        active_cls = 'active' if i == 0 else ''
        switcher_html += f'<button class="pdf-switcher-btn {active_cls}" onclick="switchPdf(this, \'{f["id"]}\')"><i class="fas fa-file-pdf"></i> {f["label"]}</button>\n'
    
    return head + f"""
<body>
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T5H3TNJ4" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <div id="navbar-placeholder"></div>
    <div class="resource-content active">
        <div class="container">
            <div class="ad-card-inject"></div>
            <h1 class="visually-hidden">{title}</h1>
            <div class="modern-section-header">
                <h2>{title}</h2>
            </div>
            
            <div class="pdf-switcher-container">
                <div class="pdf-switcher-bar">
                    {switcher_html}
                </div>
            </div>

            <section class="pdf-viewer" style="text-align:center;padding-bottom:40px;">
                <div class="pdf-wrapper">
                    <a href="https://t.me/islembacdz" target="_blank" rel="noopener" style="margin-bottom:20px;" class="search-telegram-btn">
                        <i class="fab fa-telegram-plane"></i>
                        <span>انضم إلينا على التلغرام</span>
                    </a>
                    
                    <iframe src="https://drive.google.com/file/d/{files[0]["id"]}/preview"
                        class="responsive-pdf" loading="lazy" allowfullscreen></iframe>
                    
                    <div class="pdf-buttons">
                        <button onclick="toggleFullScreen(event)" class="full-btn" style="flex:1;border:none;font-size:16px;font-weight:500;cursor:pointer;">
                            <i class="fa-solid fa-expand"></i> تكبير الملف
                        </button>
                        <a href="https://drive.google.com/uc?export=download&id={files[0]["id"]}" download class="down-btn"
                            style="flex:1;text-decoration:none;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:500;">
                            <i class="fa-solid fa-download"></i> تحميل الملف
                        </a>
                    </div>
                </div>
            </section>
            
            <div style="text-align:center;margin-top:1.5rem;">
                <a href="{back_url}" class="modern-cta-btn"><i class="fas fa-arrow-right"></i> العودة لـ {back_label}</a>
            </div>
        </div>
    </div>
    <div id="global-cta-placeholder"></div>
    <div id="footer-placeholder"></div>
    <script src="/ads-config.js?v=1.12"></script>
    <script src="/components/shared.js?v=9.34"></script>
    <script src="/script.js?v=8.7"></script>
    <!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{{"token": "6153c3a6dd54435780cd9d84f9f958f8"}}'></script><!-- End Cloudflare Web Analytics -->
</body>
</html>"""


# ── Generate all files ────────────────────────────────────────────────────────
all_new_urls = []

for stream in ["math", "sci", "engineering"]:
    sa = STREAM_INFO[stream]["ar"]
    base = f"resources/{stream}/math/moktasabat"
    base_url = f"/resources/{stream}/math/moktasabat"
    math_hub_url = f"/resources/{stream}/math"
    math_hub_label = f"الرياضيات — {sa}"

    bc_root = [("الرئيسية", "/"), ("المصادر الدراسية", "/resources"),
               (sa, f"/resources/{stream}"), ("الرياضيات", math_hub_url)]
    
    os.makedirs(base, exist_ok=True)

    # 1. Moktasabat Hub
    hub_title = "المكتسبات القبلية في الرياضيات"
    hub_desc = f"{hub_title} — {sa} بكالوريا 2027. الملخصات وسلاسل التمارين."
    bc_hub = bc_root + [(hub_title, base_url)]
    
    p_hub = f"resources/{stream}/math/moktasabat.html"
    with open(p_hub, "w", encoding="utf-8") as f:
        f.write(make_hub_page(hub_title, hub_desc, base_url, math_hub_url, "الرياضيات", bc_hub, stream, base_url))
    all_new_urls.append((base_url, "monthly"))
    print(f"Created {p_hub}")

    # 2. Resume
    r_title = "ملخص المكتسبات القبلية في الرياضيات"
    r_desc = f"{r_title} — {sa} بكالوريا 2027."
    bc_r = bc_hub + [("الملخص", f"{base_url}/resume")]
    p_r = f"{base}/resume.html"
    with open(p_r, "w", encoding="utf-8") as f:
        f.write(make_resume_page(r_title, r_desc, f"{base_url}/resume", base_url, "المكتسبات القبلية", bc_r, stream))
    all_new_urls.append((f"{base_url}/resume", "monthly"))
    print(f"Created {p_r}")

    # 3. Exercises
    e_title = "سلاسل تمارين المكتسبات القبلية في الرياضيات"
    e_desc = f"{e_title} — {sa} بكالوريا 2027."
    bc_e = bc_hub + [("سلاسل التمارين", f"{base_url}/exercises")]
    p_e = f"{base}/exercises.html"
    with open(p_e, "w", encoding="utf-8") as f:
        f.write(make_exercises_page(e_title, e_desc, f"{base_url}/exercises", base_url, "المكتسبات القبلية", bc_e, stream))
    all_new_urls.append((f"{base_url}/exercises", "monthly"))
    print(f"Created {p_e}")

# Update sitemap
sitemap_entries = ""
for url, freq in all_new_urls:
    sitemap_entries += f"""
  <url>
    <loc>https://www.bac-story.com{url}</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>{freq}</changefreq>
    <priority>0.7</priority>
  </url>"""

with open("sitemap.xml", "r", encoding="utf-8") as f:
    sitemap = f.read()
sitemap = sitemap.replace("</urlset>", sitemap_entries + "\n</urlset>")
with open("sitemap.xml", "w", encoding="utf-8") as f:
    f.write(sitemap)
print("Sitemap updated.")
