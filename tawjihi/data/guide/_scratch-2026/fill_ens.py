# -*- coding: utf-8 -*-
"""
Fill ENS annexe 09 (Circulaire 2026, printed pages 153-168 / PDF pages 154-169)
into programs.json. Data below was ground-truthed by VISUAL page reads of PDF
pages 156-169 (rendered at 160dpi) on 2026-07-14; the text layer's digits are
garbled and were NOT trusted.

Also handles the 5 leftover bad codes:
  - I03LAN00 removed (garbled duplicate of I03LAN01/02, visual check p88)
  - A00TCN01 / A05TCN00 / B00IAN01 / F01TPN01 kept with index-only note
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
PROGRAMS = os.path.join(HERE, "..", "programs.json")

# ---- priority patterns -------------------------------------------------
def P(*groups):
    """groups = lists of stream codes; group i -> priority i+1"""
    out = []
    for i, g in enumerate(groups):
        for s in g:
            out.append({"stream": s, "priority": i + 1})
    return out

ALL7 = ["sciexp", "math", "techmath", "gestion", "lettres", "langues", "arts"]
ALL_P1   = [{"stream": s, "priority": 1} for s in ALL7]
LIT      = P(["lettres", "langues"], ["sciexp", "math", "techmath"])          # لغات/آداب أولا
SCI      = P(["math", "techmath"], ["sciexp"])                                # رياضيات/تقني أولا
ARTS     = P(["arts"], ["sciexp", "math", "techmath", "gestion", "lettres", "langues"])
ECO      = P(["gestion"], ["math", "sciexp", "techmath"], ["lettres", "langues"])
SCINAT   = [{"stream": "sciexp", "priority": None}, {"stream": "math", "priority": None}]  # مجموعة واحدة
PHILO    = [{"stream": "lettres", "priority": None}]
ARABPRIM = P(["sciexp", "math"], ["lettres", "langues", "techmath", "gestion"])
TECH     = P(["techmath"], ["math", "sciexp"])  # A-codes: P1 = تقني رياضي تخصص الشعبة

# ---- institution shorthands -------------------------------------------
def ENS(*cities):
    m = {
        "الأغواط": "المدرسة العليا للأساتذة بالأغواط",
        "بوزريعة": "المدرسة العليا للأساتذة ببوزريعة",
        "القبة": "المدرسة العليا للأساتذة بالقبة",
        "قسنطينة": "المدرسة العليا للأساتذة بقسنطينة",
        "سطيف": "المدرسة العليا للأساتذة بسطيف",
        "ورقلة": "المدرسة العليا للأساتذة بورقلة",
        "بشار": "المدرسة العليا للأساتذة ببشار",
        "مستغانم": "المدرسة العليا للأساتذة بمستغانم",
        "وهران": "المدرسة العليا للأساتذة بوهران",
        "سعيدة": "المدرسة العليا للأستاذة بسعيدة",
        "بوسعادة": "المدرسة العليا للأساتذة ببوسعادة",
        "سكيكدة": "المدرسة العليا لأساتذة التعليم التقني بسكيكدة",
        "الصم": "المدرسة العليا لأساتذة الصم البكم",
    }
    return [m[c] for c in cities]

TIZI = ["ملحقة تيزي وزو (المدرسة العليا للأساتذة ببوزريعة)"]

COND_T = "يتم الترتيب على أساس المعدل العام المحصل عليه في امتحان البكالوريا الذي يجب أن يساوي أو يفوق {}/20"
COND_N = "يتم الترتيب على أساس المعدل العام المحصل عليه في امتحان البكالوريا"
COND_A = ("يتم الترتيب على أساس المعدل العام المحصل عليه في امتحان البكالوريا؛ "
          "الأولوية 1 (تقني رياضي تخصص {spec}): المعدل ≥ 12.00/20؛ "
          "الأولوية 2 (تقني رياضي التخصصات الأخرى، رياضيات، علوم تجريبية): المعدل ≥ 13.00/20")

NOTE_LOCAL = "ENS annexe 09 — تسجيل محلي حسب ولاية شهادة البكالوريا؛ ملاحق وأقسام بجامعات تستقبل حسب الولاية (انظر الملحق 09)"
NOTE_NAT = "ENS annexe 09 — تسجيل وطني"

# code: (streams, minThreshold, scope, institutions, conditions, note, printed_page)
D = {}

# ============== أستاذ التعليم الابتدائي (تسجيل محلي) ==============
D["L00PPL01"] = (ARABPRIM, 11.0, "regional", ENS("الأغواط","بوزريعة","قسنطينة","سعيدة","بشار"), COND_T.format("11.00"), NOTE_LOCAL, 155)
D["H01PPL01"] = (LIT, 11.0, "regional", ENS("الأغواط","بوزريعة","قسنطينة","ورقلة","بشار","سعيدة"), COND_T.format("11.00"), NOTE_LOCAL, 156)
D["H06PPL01"] = (LIT, 11.0, "regional", ENS("الأغواط","بوزريعة","قسنطينة","ورقلة","سعيدة","بشار","بوسعادة","وهران"), COND_T.format("11.00"), NOTE_LOCAL, 157)
_m00pp = (list(ALL_P1), None, "regional", ENS("بوزريعة") + TIZI, COND_N,
          NOTE_LOCAL + "؛ الفهرس يذكر M00PPN01 وجدول التفصيل M00PPL01 لنفس التخصص (ازدواج رمز في المصدر)", 156)
D["M00PPL01"] = _m00pp
D["M00PPN01"] = _m00pp
_j00pp = (list(ALL_P1), None, "regional",
          ENS("الأغواط","ورقلة","بوسعادة") + ["ملحقة الشلف (المدرسة العليا للأساتذة بمستغانم)","ملحقة تيسمسيلت (المدرسة العليا للأساتذة بمستغانم)"],
          COND_N, NOTE_LOCAL + "؛ الفهرس يذكر J00PPN01 وجدول التفصيل J00PPL01 لنفس التخصص (ازدواج رمز في المصدر)", 157)
D["J00PPL01"] = _j00pp
D["J00PPN01"] = _j00pp

# ============== أستاذ التعليم المتوسط ==============
D["L00PML01"] = (LIT, 12.0, "regional", ENS("بوزريعة","الأغواط","سطيف","ورقلة","بشار","قسنطينة","مستغانم","وهران","سعيدة"), COND_T.format("12.00"), NOTE_LOCAL, 158)
D["H01PML01"] = (LIT, 12.0, "regional", ENS("الأغواط","بوزريعة","قسنطينة","ورقلة","مستغانم","سطيف","بشار","سعيدة"), COND_T.format("12.00"), NOTE_LOCAL, 158)
D["M00PMN01"] = (list(ALL_P1), None, "national", TIZI, COND_N, NOTE_NAT, 158)
D["H06PML01"] = (LIT, 12.0, "regional", ENS("بوزريعة","الأغواط","قسنطينة","ورقلة","سطيف","بشار","سعيدة"), COND_T.format("12.00"), NOTE_LOCAL, 159)
D["K00PMN01"] = (list(ARTS), None, "national", ENS("القبة"), COND_N, NOTE_NAT, 159)
D["I00PML01"] = (LIT, 12.0, "regional", ENS("بوزريعة","سطيف","قسنطينة","الأغواط","ورقلة"), COND_T.format("12.00"), NOTE_LOCAL, 159)
D["C01PML01"] = (SCI, 12.0, "regional", ENS("القبة","قسنطينة","سكيكدة","بشار"), COND_T.format("12.00"), NOTE_LOCAL, 160)
D["D00PML01"] = (list(SCINAT), 12.0, "regional", ENS("القبة","الأغواط","سكيكدة","قسنطينة","ورقلة","سطيف","وهران","سعيدة"), COND_T.format("12.00"), NOTE_LOCAL + "؛ الشعبتان في مجموعة واحدة دون ترتيب أولوية", 160)
D["C02PML01"] = (SCI, 12.0, "regional", ENS("القبة","الأغواط","سكيكدة","قسنطينة","ورقلة","سطيف","بشار","بوسعادة","وهران","سعيدة"), COND_T.format("12.00"), NOTE_LOCAL, 160)
D["B00PML01"] = (SCI, 12.0, "regional", ENS("القبة","الأغواط","سكيكدة","قسنطينة","ورقلة","سطيف","بشار","بوسعادة","وهران","سعيدة"), COND_T.format("12.00"), NOTE_LOCAL, 161)
D["J00PML01"] = (list(ALL_P1), None, "regional",
                 ["ملحقة الشلف (المدرسة العليا للأساتذة بمستغانم)","ملحقة الجلفة (المدرسة العليا للأساتذة بالقبة)",
                  "جامعة المسيلة (المدرسة العليا للأساتذة ببوسعادة)","جامعة سطيف 2 (المدرسة العليا للأساتذة بسطيف)",
                  "جامعة قسنطينة 2 (المدرسة العليا للأساتذة بقسنطينة)","جامعة الجزائر 3 (المدرسة العليا للأساتذة ببوزريعة)"],
                 COND_N, NOTE_LOCAL, 161)
D["I02PML01"] = (list(ALL_P1), 12.0, "regional",
                 ["جامعة الجزائر 1 (المدرسة العليا للأساتذة ببوزريعة)","جامعة قسنطينة للعلوم الإسلامية الأمير عبد القادر (المدرسة العليا للأساتذة بقسنطينة)","جامعة وهران 1 (المدرسة العليا للأساتذة بوهران)"],
                 COND_T.format("12.00"), NOTE_LOCAL, 161)
D["K00PML01"] = (list(ALL_P1), 12.0, "regional",
                 ["جامعة قسنطينة 3 (المدرسة العليا للأساتذة بقسنطينة)","جامعة تيارت (المدرسة العليا للأساتذة بوهران)"],
                 COND_T.format("12.00"), NOTE_LOCAL, 161)

# ============== أستاذ التعليم الثانوي ==============
D["L00PSL01"] = (LIT, 13.0, "regional", ENS("بوزريعة","الأغواط","سطيف","ورقلة","بشار","قسنطينة","بوسعادة","مستغانم","وهران","سعيدة"), COND_T.format("13.00"), NOTE_LOCAL, 162)
D["M00PSN01"] = (list(ALL_P1), None, "national", TIZI, COND_N, NOTE_NAT, 162)
D["H01PSL01"] = (LIT, 13.0, "regional", ENS("بوزريعة","الأغواط","سطيف","ورقلة","بشار","قسنطينة","بوسعادة","مستغانم","وهران","سعيدة"), COND_T.format("13.00"), NOTE_LOCAL, 163)
D["H06PSL01"] = (LIT, 13.0, "regional", ENS("بوزريعة","الأغواط","سطيف","ورقلة","بشار","قسنطينة","وهران","سعيدة"), COND_T.format("13.00"), NOTE_LOCAL, 163)
D["I00PSL01"] = (LIT, 13.0, "regional", ENS("بوزريعة","سطيف","قسنطينة","الأغواط","ورقلة"), COND_T.format("13.00"), NOTE_LOCAL, 163)
D["I13PSL01"] = (list(PHILO), 13.0, "regional", ENS("بوزريعة","قسنطينة"), COND_T.format("13.00"), NOTE_LOCAL + "؛ شعبة آداب وفلسفة فقط", 164)
D["D00PSL01"] = (list(SCINAT), 13.0, "regional", ENS("القبة","الأغواط","سطيف","ورقلة","سكيكدة","قسنطينة","وهران","سعيدة"), COND_T.format("13.00"), NOTE_LOCAL + "؛ الشعبتان في مجموعة واحدة دون ترتيب أولوية", 164)
D["C02PSL01"] = (SCI, 13.0, "regional", ENS("القبة","الأغواط","سكيكدة","قسنطينة","ورقلة","سطيف","بشار","بوسعادة","مستغانم","سعيدة"), COND_T.format("13.00"), NOTE_LOCAL, 164)
D["B00PSL01"] = (SCI, 13.0, "regional", ENS("القبة","الأغواط","سكيكدة","قسنطينة","ورقلة","سطيف","بشار","بوسعادة","مستغانم","سعيدة"), COND_T.format("13.00"), NOTE_LOCAL, 165)
D["C01PSL01"] = (SCI, 13.0, "regional", ENS("القبة","الأغواط","بشار","قسنطينة"), COND_T.format("13.00"), NOTE_LOCAL, 165)
D["J00PSL01"] = (list(ALL_P1), None, "regional",
                 ["ملحقة الشلف (المدرسة العليا للأساتذة بمستغانم)","ملحقة الجلفة (المدرسة العليا للأساتذة بالقبة)",
                  "جامعة الجزائر 3 (المدرسة العليا للأساتذة ببوزريعة)","جامعة المسيلة (المدرسة العليا للأساتذة ببوسعادة)",
                  "جامعة قسنطينة 2 (المدرسة العليا للأساتذة بقسنطينة)","جامعة سطيف 2 (المدرسة العليا للأساتذة بسطيف)"],
                 COND_N, NOTE_LOCAL, 165)
D["F00PSL01"] = (ECO, None, "regional",
                 ["ملحقة المدية (المدرسة العليا للأساتذة بالقبة)","ملحقة تلمسان (المدرسة العليا للأساتذة بوهران)","جامعة قسنطينة 2 (المدرسة العليا للأساتذة بقسنطينة)"],
                 COND_N, NOTE_LOCAL, 165)
D["I02PSL01"] = (list(ALL_P1), 13.0, "regional",
                 ["جامعة الجزائر 1 (المدرسة العليا للأساتذة ببوزريعة)","جامعة قسنطينة للعلوم الإسلامية الأمير عبد القادر (المدرسة العليا للأساتذة بقسنطينة)","جامعة وهران 1 (المدرسة العليا للأساتذة بوهران)"],
                 COND_T.format("13.00"), NOTE_LOCAL, 166)
D["H07PSN01"] = (LIT, 13.0, "national", ["جامعة البليدة 2 (المدرسة العليا للأساتذة ببوزريعة)"], COND_T.format("13.00"), NOTE_NAT, 166)
D["H04PSN01"] = (LIT, 13.0, "national", ["جامعة وهران 2 (المدرسة العليا للأساتذة بوهران)"], COND_T.format("13.00"), NOTE_NAT, 166)
D["H02PSN01"] = (LIT, 13.0, "national", ["جامعة وهران 2 (المدرسة العليا للأساتذة بوهران)"], COND_T.format("13.00"), NOTE_NAT, 166)
D["K00PSN01"] = (list(ARTS), None, "national", ENS("القبة"), COND_N, NOTE_NAT, 166)
D["K00PSN02"] = (list(ARTS), None, "regional", ["جامعة قسنطينة 3 (المدرسة العليا للأساتذة بقسنطينة)"], COND_N,
                 "ENS annexe 09 — تسجيل حسب الولاية (الدوائر المذكورة)", 166,
                 [4,5,6,7,10,11,12,15,18,19,21,23,24,25,28,30,33,34,35,36,39,40,41,43,44,51,56,57,58])
D["K00PSN03"] = (list(ARTS), None, "regional", ["جامعة تيارت (المدرسة العليا للأساتذة بوهران)"], COND_N,
                 "ENS annexe 09 — تسجيل حسب الولاية (الدوائر المذكورة)", 166,
                 [1,2,3,8,9,13,14,16,17,20,22,26,27,29,31,32,37,38,42,45,46,47,48,49,50,52,53,54,55])
D["K00PSL01"] = (list(ARTS), None, "regional",
                 ["جامعة قسنطينة 3 (المدرسة العليا للأساتذة بقسنطينة)","جامعة تيارت (المدرسة العليا للأساتذة بوهران)"],
                 COND_N,
                 "ENS annexe 09 — رمز الفهرس لأستاذ التعليم الثانوي في الرسم؛ جدول التفصيل يستعمل الرمزين K00PSN02/K00PSN03 (ازدواج رموز في المصدر)", 155)

# A-codes (ENSET سكيكدة + ملحقة معسكر) — أولوية 1: تقني رياضي تخصص الشعبة (≥12)، أولوية 2 (≥13)
_ENSA = ENS("سكيكدة") + ["ملحقة معسكر (المدرسة العليا للأستاذة بسعيدة)"]
for code, spec, page in [("A19PSL01","هندسة ميكانيكية",167),("A05PSL01","هندسة مدنية",167),
                          ("A16PSL01","هندسة كهربائية",167),("A08PSL01","هندسة الطرائق",167)]:
    D[code] = (TECH, 12.0, "regional", list(_ENSA), COND_A.format(spec=spec),
               NOTE_LOCAL + "؛ العتبة حسب الأولوية: 12.00 للأولوية 1 و13.00 للأولوية 2", page)

# ============== المدرسة العليا لأساتذة الصم البكم (تسجيل وطني) ==============
_DEAF = ENS("الصم")
NOTE_DEAF = "ENS annexe 09 — المدرسة العليا لأساتذة الصم البكم؛ تسجيل وطني"
D["B00PAN01"] = (SCI, 13.0, "national", _DEAF, COND_T.format("13.00"), NOTE_DEAF, 168)
D["C01PAN01"] = (SCI, 13.0, "national", _DEAF, COND_T.format("13.00"), NOTE_DEAF, 168)
D["C02PAN01"] = (SCI, 13.0, "national", _DEAF, COND_T.format("13.00"), NOTE_DEAF, 168)
D["D00PAN01"] = (list(SCINAT), 13.0, "national", _DEAF, COND_T.format("13.00"), NOTE_DEAF + "؛ الشعبتان في مجموعة واحدة دون ترتيب أولوية", 168)
D["L00PAN01"] = (LIT, 13.0, "national", _DEAF, COND_T.format("13.00"), NOTE_DEAF, 168)
D["H01PAN01"] = (LIT, 13.0, "national", _DEAF, COND_T.format("13.00"), NOTE_DEAF, 168)
D["H06PAN01"] = (LIT, 13.0, "national", _DEAF, COND_T.format("13.00"), NOTE_DEAF, 168)
D["M00PAN01"] = (list(ALL_P1), None, "national", _DEAF, COND_N, NOTE_DEAF, 168)
D["J00PAN01"] = (list(ALL_P1), None, "national", _DEAF, COND_N, NOTE_DEAF, 168)
D["I00PAN01"] = (LIT, 13.0, "national", _DEAF, COND_T.format("13.00"), NOTE_DEAF, 168)
D["F00PAN01"] = (ECO, None, "national", _DEAF, COND_N, NOTE_DEAF, 168)
D["I02PAN01"] = (list(ALL_P1), 13.0, "national", _DEAF, COND_T.format("13.00"), NOTE_DEAF, 168)
D["K00PAN01"] = (list(ARTS), None, "national", _DEAF, COND_N, NOTE_DEAF, 168)
D["A16PAN01"] = (TECH, 12.0, "national", _DEAF, COND_A.format(spec="هندسة كهربائية"), NOTE_DEAF + "؛ العتبة حسب الأولوية: 12.00 للأولوية 1 و13.00 للأولوية 2", 168)
D["A08PAN01"] = (TECH, 12.0, "national", _DEAF, COND_A.format(spec="هندسة الطرائق"), NOTE_DEAF + "؛ العتبة حسب الأولوية: 12.00 للأولوية 1 و13.00 للأولوية 2", 168)

INDEX_ONLY = ["A00TCN01", "A05TCN00", "B00IAN01", "F01TPN01"]
REMOVE = ["I03LAN00"]

def main():
    with open(PROGRAMS, encoding="utf-8") as f:
        data = json.load(f)
    progs = data["programs"]
    by_code = {p["code"]: p for p in progs}

    filled, missing = [], []
    for code, spec in D.items():
        streams, thr, scope, inst, cond, note, page = spec[:7]
        circles = spec[7] if len(spec) > 7 else []
        p = by_code.get(code)
        if p is None:
            missing.append(code)
            continue
        p["allowedStreams"] = [dict(s) for s in streams]
        p["minThreshold"] = thr
        p["scope"] = scope
        p["institutions_ar"] = inst
        p["rankingBasis"] = "general"
        p["conditions_ar"] = cond
        p["circleWilayaNums"] = circles
        p["_note"] = note
        p["_confidence"] = "high"
        p["_page"] = page
        filled.append(code)

    # index-only bad codes
    for code in INDEX_ONLY:
        p = by_code.get(code)
        if p:
            p["_note"] = "index-only — no detail row in circulaire"
    # remove garbled duplicate
    before = len(progs)
    data["programs"] = [p for p in progs if p["code"] not in REMOVE]
    removed = before - len(data["programs"])

    data["_source"] = "Circulaire MESRS 2026-07-07 (annexes 01-09 incl. ENS)"
    data["_extracted"] = "2026-07-14"

    with open(PROGRAMS, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    # validation
    empty = [p["code"] for p in data["programs"] if not p.get("allowedStreams")]
    print("filled:", len(filled), "missing_in_programs:", missing, "removed:", removed)
    print("still empty:", sorted(empty))

if __name__ == "__main__":
    main()
