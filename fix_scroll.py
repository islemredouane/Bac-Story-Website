import re
import glob

css_new = """
    <style>
        /* ── Premium PDF Switcher Bar ── */
        .pdf-switcher-wrap {
            text-align: center;
            margin: 0 0 20px 0;
            display: flex;
            justify-content: center;
            width: 100%;
        }
        .pdf-switcher-toggle {
            display: inline-flex !important;
            align-items: center;
            position: relative;
            vertical-align: top;
            background: #f1f5f9;
            border-radius: 999px;
            padding: 4px;
            gap: 0;
            border: 1px solid rgba(44, 92, 197, 0.1);
            max-width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            white-space: nowrap;
            -webkit-overflow-scrolling: touch;
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .pdf-switcher-toggle::-webkit-scrollbar {
            display: none;
        }
        .pdf-switcher-pill {
            position: absolute;
            top: 4px; bottom: 4px;
            background: #2c5cc5;
            border-radius: 999px;
            transition: left 0.28s cubic-bezier(0.34,1.56,0.64,1), width 0.28s cubic-bezier(0.34,1.56,0.64,1);
            box-shadow: 0 2px 8px rgba(44,92,195,0.3);
            pointer-events: none;
            z-index: 0;
        }
        .pdf-switcher-tab {
            position: relative; z-index: 1;
            margin: 0 !important;
            padding: 0.5rem 1.4rem;
            border: none; background: transparent; border-radius: 999px;
            font-family: 'Tajawal', sans-serif; font-size: 0.9rem; font-weight: 700;
            color: #64748b; cursor: pointer; white-space: nowrap;
            transition: color 0.22s ease;
            display: inline-flex; align-items: center; gap: 6px;
            user-select: none;
            flex-shrink: 0;
            width: auto !important;
            min-width: 0 !important;
            box-shadow: none !important;
        }
        .pdf-switcher-tab.active {
            color: #fff !important;
        }
        @media (max-width: 600px) {
            .pdf-switcher-tab { padding: 0.5rem 0.9rem; font-size: 0.8rem; }
        }
    </style>
"""

for filepath in glob.glob("resources/**/exercises.html", recursive=True):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Remove existing inline style
    content = re.sub(r'\s*<style>\s*/\* ── Premium PDF Switcher Bar ── \*/.*?</style>', '', content, flags=re.DOTALL)
    
    # Inject new style before </head>
    content = content.replace("</head>", css_new + "</head>")
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated {filepath} with fixed rounded edges")
