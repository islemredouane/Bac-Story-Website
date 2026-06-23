/* ============================================================
   TAWJIHI - Eligibility "brain" (shared, dependency-free)
   AUTO-GENERATED from tawjihi/data/catalog-eligibility.json
   (generator: tawjihi/data/_scratch/gen_eligibility.py)
   Do NOT edit by hand; regenerate instead.

   Browser global script (plain <script src>, no modules/imports).
   Exposes:
     window.TW_ELIG            - the byId eligibility map
     window.twElig(id)         - record | null
     window.twWilayaList()     - [{num, ar}, ...]  (clean 58 wilayas)
     window.twWilayaName(num)  - "ar name" | ""
     window.twIsStreamAllowed(id, stream) - bool
     window.twWilayaEligible(id, wilayaNum) - bool
     window.twAccessibility(id, userAvg, stream) - {status, threshold, scope, rankingBasis, note}
   ============================================================ */
(function (root) {
  "use strict";

  // --- eligibility map keyed by catalog id ---
  var TW_ELIG = {
  "esi": {
    "linkedProgramCodes": [
      "C00CAN01"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 18.19,
      "math": 18.55,
      "techmath": 18.93
    },
    "sourceConfidence": "medium",
    "_note": "linked via explicit grande-ecole code_fil; thresholds from grande-ecole code_fil records",
    "_method": "explicit_codefil"
  },
  "ensia": {
    "linkedProgramCodes": [
      "C00CAN04"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 18.59,
      "math": 18.95,
      "techmath": 19.37
    },
    "sourceConfidence": "medium",
    "_note": "linked via explicit grande-ecole code_fil; thresholds from grande-ecole code_fil records",
    "_method": "explicit_codefil"
  },
  "estin": {
    "linkedProgramCodes": [
      "C00CAN03"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 17.45,
      "math": 17.79,
      "techmath": 18.15
    },
    "sourceConfidence": "medium",
    "_note": "linked via explicit grande-ecole code_fil; thresholds from grande-ecole code_fil records",
    "_method": "explicit_codefil"
  },
  "med": {
    "linkedProgramCodes": [
      "PD0LAN01",
      "PI0LAN01"
    ],
    "allowedStreams": [
      "math",
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 16.65,
      "math": 17.15
    },
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=MEDECINE; national thresholds from admissions.nationale; allowedStreams fallback to card.streamCodes (no program link)",
    "_method": "nationale"
  },
  "pharm": {
    "linkedProgramCodes": [
      "P05LAN01",
      "P06LAN01",
      "X11SANTE"
    ],
    "allowedStreams": [
      "math",
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 16.26,
      "math": 16.76
    },
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=PHARMACIE; national thresholds from admissions.nationale",
    "_method": "nationale"
  },
  "dent": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 16.99,
      "math": 17.5
    },
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=MEDECINE DENTAIRE; national thresholds from admissions.nationale; allowedStreams fallback to card.streamCodes (no program link)",
    "_method": "nationale"
  },
  "archi": {
    "linkedProgramCodes": [
      "N00CAN01",
      "N02FPN06",
      "N02FPN07",
      "N05IAL01",
      "N05IAL02",
      "NA0LAN01"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 11.1,
      "math": 11.8
    },
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=ARCHITECTURE",
    "_method": "catalog_averages"
  },
  "info": {
    "linkedProgramCodes": [
      "C00CAN01",
      "C00CAN02",
      "C01EPN01",
      "C01FPN02",
      "C01FPN03",
      "C01LAL01",
      "C01LAL02",
      "C01LAL03",
      "C01PML01",
      "C01PSL01",
      "C01TCL01",
      "C01TCL02",
      "C01TCL03",
      "CA0LAN01",
      "CF0LAN02",
      "FC1LAN02",
      "FC1LPN01",
      "FF1LAN01",
      "GC0LAN01",
      "GC0LAN02",
      "IC0LAN01",
      "PC0LAN01",
      "PC0LAN02",
      "PC0LAN03",
      "PC0LAN04",
      "PC0LAN05"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 10.04,
      "math": 10.04,
      "techmath": 18.06
    },
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=INFORMATIQUE",
    "_method": "catalog_averages"
  },
  "esc": {
    "linkedProgramCodes": [
      "CF0LAN01",
      "CF0LAN03",
      "CF0LAN04",
      "CF0LAN05",
      "CF0LAN06",
      "CF1LPN01",
      "CF1LPN02",
      "CF1LPN03",
      "F00CAN01",
      "F00CAN02",
      "F00CAN03",
      "F00CAN06",
      "F00CAN08",
      "F00FCL01",
      "F00FCL02",
      "F00FCL03",
      "F00FCL04",
      "F00FCL05",
      "F00FCL06",
      "F00FCL07",
      "F00LAL01",
      "F00LAL02",
      "F00LAL03",
      "F00LAL04",
      "F00PSL01",
      "F00TPN02",
      "F00TPN03",
      "F01FPN01",
      "F01FPN02",
      "F01LPL01",
      "F01LPN01",
      "F02FPN01",
      "F03FPN02",
      "F03LPL01",
      "F03LPL02",
      "F04EAN01",
      "F04EAN03",
      "FC1LAN01",
      "IF0LAN01",
      "IF1LAN01",
      "N01FPN02",
      "N01FPN03",
      "N01FPN04",
      "N01IAN01",
      "N01LAL01",
      "N02FPN01",
      "N02FPN02",
      "N02FPN03",
      "N02FPN04",
      "N02FPN05",
      "N02FPN08",
      "N02FPN09",
      "N02LAN01",
      "PF0LAN01",
      "PF0LAN02",
      "PF0LAN03"
    ],
    "allowedStreams": [
      "gestion",
      "langues",
      "lettres",
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "general",
    "thresholdsByStream": {
      "sciexp": 10.0,
      "math": 10.0,
      "techmath": 10.08
    },
    "sourceConfidence": "medium",
    "_note": "linked via admissions by_filiere filiere_key=SCIENCES ECONOMIQUES; thresholds from grande-ecole code_fil records",
    "_method": "extra_filiere_key"
  },
  "eco": {
    "linkedProgramCodes": [
      "CF0LAN01",
      "CF0LAN03",
      "CF0LAN04",
      "CF0LAN05",
      "CF0LAN06",
      "CF1LPN01",
      "CF1LPN02",
      "CF1LPN03",
      "F00CAN01",
      "F00CAN02",
      "F00CAN03",
      "F00CAN06",
      "F00CAN08",
      "F00FCL01",
      "F00FCL02",
      "F00FCL03",
      "F00FCL04",
      "F00FCL05",
      "F00FCL06",
      "F00FCL07",
      "F00LAL01",
      "F00LAL02",
      "F00LAL03",
      "F00LAL04",
      "F00PSL01",
      "F00TPN02",
      "F00TPN03",
      "F01FPN01",
      "F01FPN02",
      "F01LPL01",
      "F01LPN01",
      "F02FPN01",
      "F03FPN02",
      "F03LPL01",
      "F03LPL02",
      "F04EAN01",
      "F04EAN03",
      "FC1LAN01",
      "IF0LAN01",
      "IF1LAN01",
      "N01FPN02",
      "N01FPN03",
      "N01FPN04",
      "N01IAN01",
      "N01LAL01",
      "N02FPN01",
      "N02FPN02",
      "N02FPN03",
      "N02FPN04",
      "N02FPN05",
      "N02FPN08",
      "N02FPN09",
      "N02LAN01",
      "PF0LAN01",
      "PF0LAN02",
      "PF0LAN03"
    ],
    "allowedStreams": [
      "gestion",
      "langues",
      "lettres",
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "general",
    "thresholdsByStream": {
      "sciexp": 10.0,
      "math": 10.0,
      "techmath": 10.08
    },
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=SCIENCES ECONOMIQUES",
    "_method": "catalog_averages"
  },
  "bio": {
    "linkedProgramCodes": [
      "D00LAL01",
      "D00LAL02",
      "D00LAL03",
      "D00LAL04"
    ],
    "allowedStreams": [
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted",
    "thresholdsByStream": {
      "sciexp": 10.21
    },
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=SCIENCES DE LA NATURE ET DE LA VIE",
    "_method": "catalog_averages"
  },
  "math": {
    "linkedProgramCodes": [
      "C00CAN05",
      "C02FPN01",
      "C02LAL01",
      "C02LAL02",
      "C02LAL03",
      "C02PML01",
      "C02PSL01",
      "C03FPN01",
      "C03IAN01",
      "CC1LAN01"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 10.02,
      "math": 10.0,
      "techmath": 18.15
    },
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=MATHEMATIQUES",
    "_method": "catalog_averages"
  },
  "education": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "gestion",
      "langues",
      "lettres",
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "gestion": 10.0,
      "langues": 10.0,
      "lettres": 10.0,
      "sciexp": 10.0
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "genie-civil": {
    "linkedProgramCodes": [
      "A05IAN01",
      "A05IAN02",
      "A05PSL01",
      "A05TCL01",
      "A05TCL02",
      "A05TPN02"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 10.17,
      "math": 13.78
    },
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=GENIE CIVIL",
    "_method": "catalog_averages"
  },
  "genie-elec": {
    "linkedProgramCodes": [
      "A09IAN01",
      "A09IAN04",
      "A16FPN01",
      "A16FPN02",
      "A16IAN01",
      "A16LAN01",
      "A16TCL01"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 10.14,
      "math": 14.02
    },
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=ELECTROTECHNIQUE; linked via admissions by_filiere filiere_key=ELECTROTECHNIQUE",
    "_method": "catalog_averages"
  },
  "droit": {
    "linkedProgramCodes": [
      "G02FCL01",
      "G02FCL02",
      "G02FCL03",
      "G02FCL04",
      "G02FCL05",
      "G02FCL06",
      "G02FCL07",
      "G02LAL01",
      "G02LAL02",
      "G02LAL03",
      "G02LAN01",
      "GF0LAN01"
    ],
    "allowedStreams": [
      "arts",
      "gestion",
      "langues",
      "lettres",
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "general",
    "thresholdsByStream": {
      "sciexp": 10.0,
      "math": 10.0,
      "techmath": 10.15
    },
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=DROIT",
    "_method": "catalog_averages"
  },
  "langues": {
    "linkedProgramCodes": [
      "H01LAL01",
      "H01LAL02",
      "H01LAL03",
      "H01PML01",
      "H01PSL01"
    ],
    "allowedStreams": [
      "arts",
      "gestion",
      "langues",
      "lettres",
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "regional",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 11.0,
      "math": 11.0,
      "techmath": 11.35
    },
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=LANGUE FRANCAISE",
    "_method": "catalog_averages"
  },
  "psych": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "gestion",
      "langues",
      "lettres",
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "gestion": 16.65,
      "langues": 16.65,
      "lettres": 16.65,
      "sciexp": 16.65
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "genie-meca": {
    "linkedProgramCodes": [
      "A19FPN02",
      "A19FPN03",
      "A19LAN01",
      "A19LAN02",
      "A19PSL01",
      "A19TCL01",
      "A19TPN01",
      "A19TPN03"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 10.31,
      "math": 12.31,
      "techmath": 12.91
    },
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=GENIE MECANIQUE",
    "_method": "catalog_averages"
  },
  "esi-sba": {
    "linkedProgramCodes": [
      "C00CAN02"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 17.36,
      "math": 17.7,
      "techmath": 18.06
    },
    "sourceConfidence": "medium",
    "_note": "linked via explicit grande-ecole code_fil; thresholds from grande-ecole code_fil records",
    "_method": "explicit_codefil"
  },
  "enscs": {
    "linkedProgramCodes": [
      "C00CAN07"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 18.34,
      "math": 18.7,
      "techmath": 19.07
    },
    "sourceConfidence": "medium",
    "_note": "linked via explicit grande-ecole code_fil; thresholds from grande-ecole code_fil records",
    "_method": "explicit_codefil"
  },
  "ensttic": {
    "linkedProgramCodes": [
      "A00TUT01",
      "A00TUT02"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted",
    "thresholdsByStream": {
      "sciexp": 16.69,
      "math": 17.57
    },
    "sourceConfidence": "medium",
    "_note": "linked via explicit grande-ecole code_fil; thresholds from grande-ecole code_fil records",
    "_method": "explicit_codefil"
  },
  "nhsm": {
    "linkedProgramCodes": [
      "C00CAN05"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 17.43,
      "math": 17.77,
      "techmath": 18.15
    },
    "sourceConfidence": "medium",
    "_note": "linked via explicit grande-ecole code_fil; thresholds from grande-ecole code_fil records",
    "_method": "explicit_codefil"
  },
  "polytech": {
    "linkedProgramCodes": [
      "A00CAN07",
      "A00CAN08"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 16.65
    },
    "sourceConfidence": "medium",
    "_note": "linked via explicit grande-ecole code_fil; thresholds from grande-ecole code_fil records",
    "_method": "explicit_codefil"
  },
  "enstp": {
    "linkedProgramCodes": [
      "A00CAN06"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 16.12
    },
    "sourceConfidence": "medium",
    "_note": "linked via explicit grande-ecole code_fil; thresholds from grande-ecole code_fil records",
    "_method": "explicit_codefil"
  },
  "ensh": {
    "linkedProgramCodes": [
      "A00CAN05"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 14.64
    },
    "sourceConfidence": "medium",
    "_note": "linked via explicit grande-ecole code_fil; thresholds from grande-ecole code_fil records",
    "_method": "explicit_codefil"
  },
  "igee": {
    "linkedProgramCodes": [
      "A00CAN03"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 16.15
    },
    "sourceConfidence": "medium",
    "_note": "linked via explicit grande-ecole code_fil; thresholds from grande-ecole code_fil records",
    "_method": "explicit_codefil"
  },
  "essa": {
    "linkedProgramCodes": [
      "A00CAN16",
      "A06IAN01",
      "A06LAN01"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 15.45
    },
    "sourceConfidence": "medium",
    "_note": "linked via explicit grande-ecole code_fil; linked via admissions by_filiere filiere_key=AERONAUTIQUE; thresholds from grande-ecole code_fil records",
    "_method": "explicit_codefil"
  },
  "enssn": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "math": 17.96,
      "sciexp": 17.96,
      "techmath": 17.96
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "ensas": {
    "linkedProgramCodes": [
      "D00CAN06",
      "D00CAN07",
      "D00CAN12",
      "D00CAN13",
      "D03FPN02",
      "D03LAN01",
      "D03LAN02",
      "D03TCL01"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 10.0,
      "math": 10.29
    },
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=SCIENCES AGRONOMIQUES",
    "_method": "catalog_averages"
  },
  "st": {
    "linkedProgramCodes": [
      "A00LAL01",
      "A00LAL02",
      "A00LAL03",
      "A00LAL04",
      "A00LAL05",
      "A00TCL01",
      "A00TCL02",
      "A00TCL03",
      "C00CAN03"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "math": 10.0,
      "sciexp": 10.0,
      "techmath": 10.0
    },
    "sourceConfidence": "card-derived",
    "_note": "streams+threshold corrected to card (threshold=card.minAvg; math/techmath from a single grande-ecole row; using card minAvg across streams); previous registry-inherited values were unreliable",
    "_method": "card_derived_correction"
  },
  "hydrocarbures": {
    "linkedProgramCodes": [
      "A03FPN02",
      "A03FPN03",
      "A03LAN01",
      "A03LAN02"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted",
    "thresholdsByStream": {
      "sciexp": 14.42
    },
    "sourceConfidence": "medium",
    "_note": "linked via admissions by_filiere filiere_key=HYDROCARBURES; thresholds from grande-ecole code_fil records",
    "_method": "extra_filiere_key"
  },
  "optique": {
    "linkedProgramCodes": [
      "A11IAN03",
      "A11LAN01"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 12.58
    },
    "sourceConfidence": "medium",
    "_note": "linked via admissions by_filiere filiere_key=OPTIQUE ET MECANIQUE DE PRECISION; thresholds from grande-ecole code_fil records",
    "_method": "extra_filiere_key"
  },
  "gp": {
    "linkedProgramCodes": [
      "A08FPN01",
      "A08IAN01",
      "A08IAN02",
      "A08PSL01",
      "A08TCL01",
      "A08TCL02",
      "A08TPN01"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 10.21,
      "math": 13.19
    },
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=GENIE DES PROCEDES",
    "_method": "catalog_averages"
  },
  "gi": {
    "linkedProgramCodes": [
      "A18LAN01"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 12.76
    },
    "sourceConfidence": "medium",
    "_note": "linked via admissions by_filiere filiere_key=GENIE INDUSTRIEL; thresholds from grande-ecole code_fil records",
    "_method": "extra_filiere_key"
  },
  "gt": {
    "linkedProgramCodes": [
      "A14LAN01"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 11.68
    },
    "sourceConfidence": "medium",
    "_note": "linked via admissions by_filiere filiere_key=INGENIERIE DES TRANSPORTS; thresholds from grande-ecole code_fil records",
    "_method": "extra_filiere_key"
  },
  "gm": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "math": 12.45,
      "sciexp": 12.45,
      "techmath": 12.45
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "gmec": {
    "linkedProgramCodes": [
      "A10LAN01"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "math": 10.31,
      "sciexp": 10.31,
      "techmath": 10.31
    },
    "sourceConfidence": "card-derived",
    "_note": "streams+threshold corrected to card (threshold=card.minAvg; GENIE MARITIME proxy bar replaced by card's materials/mechatronics minAvg); previous registry-inherited values were unreliable",
    "_method": "card_derived_correction"
  },
  "marine-eng": {
    "linkedProgramCodes": [
      "A10LAN01"
    ],
    "allowedStreams": [
      "math",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "math": 12.0,
      "techmath": 12.0
    },
    "sourceConfidence": "card-derived",
    "_note": "streams+threshold corrected to card (threshold=card.minAvg; GENIE MARITIME proxy bar replaced by card's marine-eng minAvg); previous registry-inherited values were unreliable",
    "_method": "card_derived_correction"
  },
  "vet": {
    "linkedProgramCodes": [
      "P04VAL01",
      "P04VAN01",
      "P04VAN02",
      "P04VAN03",
      "P04VAN04"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      27,
      28,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 12.26,
      "math": 12.92
    },
    "sourceConfidence": "medium",
    "_note": "linked via explicit grande-ecole code_fil; linked via admissions by_filiere filiere_key=MEDECINE VETERINAIRE; thresholds from grande-ecole code_fil records",
    "_method": "explicit_codefil"
  },
  "pharm-ind": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "math": 12.8,
      "sciexp": 12.8
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "med-bio": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "math": 16.65,
      "sciexp": 16.65
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "med-info": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "math": 10.04,
      "sciexp": 10.04
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "ensb": {
    "linkedProgramCodes": [
      "D00CAN10"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 15.67,
      "math": 16.55
    },
    "sourceConfidence": "medium",
    "_note": "linked via explicit grande-ecole code_fil; thresholds from grande-ecole code_fil records",
    "_method": "explicit_codefil"
  },
  "enssmal": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 14.45
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "kine": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 12.0
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "labo": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 11.0
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "radio": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 11.0
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "sage-femme": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 11.5
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "paramedical": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 10.5
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "ehec": {
    "linkedProgramCodes": [
      "CF0LAN01",
      "CF0LAN03",
      "CF0LAN04",
      "CF0LAN05",
      "CF0LAN06",
      "CF1LPN01",
      "CF1LPN02",
      "CF1LPN03",
      "F00CAN01",
      "F00CAN02",
      "F00CAN03",
      "F00CAN06",
      "F00CAN08",
      "F00FCL01",
      "F00FCL02",
      "F00FCL03",
      "F00FCL04",
      "F00FCL05",
      "F00FCL06",
      "F00FCL07",
      "F00LAL01",
      "F00LAL02",
      "F00LAL03",
      "F00LAL04",
      "F00PSL01",
      "F00TPN02",
      "F00TPN03",
      "F01FPN01",
      "F01FPN02",
      "F01LPL01",
      "F01LPN01",
      "F02FPN01",
      "F03FPN02",
      "F03LPL01",
      "F03LPL02",
      "F04EAN01",
      "F04EAN03",
      "FC1LAN01",
      "IF0LAN01",
      "IF1LAN01",
      "N01FPN02",
      "N01FPN03",
      "N01FPN04",
      "N01IAN01",
      "N01LAL01",
      "N02FPN01",
      "N02FPN02",
      "N02FPN03",
      "N02FPN04",
      "N02FPN05",
      "N02FPN08",
      "N02FPN09",
      "N02LAN01",
      "PF0LAN01",
      "PF0LAN02",
      "PF0LAN03"
    ],
    "allowedStreams": [
      "gestion",
      "langues",
      "lettres",
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "general",
    "thresholdsByStream": {
      "sciexp": 10.0,
      "math": 10.0,
      "techmath": 10.08
    },
    "sourceConfidence": "medium",
    "_note": "linked via explicit grande-ecole code_fil; linked via admissions by_filiere filiere_key=SCIENCES ECONOMIQUES; thresholds from grande-ecole code_fil records",
    "_method": "explicit_codefil"
  },
  "enssea": {
    "linkedProgramCodes": [
      "CF0LAN01",
      "CF0LAN03",
      "CF0LAN04",
      "CF0LAN05",
      "CF0LAN06",
      "CF1LPN01",
      "CF1LPN02",
      "CF1LPN03",
      "F00CAN01",
      "F00CAN02",
      "F00CAN03",
      "F00CAN04",
      "F00CAN06",
      "F00CAN08",
      "F00FCL01",
      "F00FCL02",
      "F00FCL03",
      "F00FCL04",
      "F00FCL05",
      "F00FCL06",
      "F00FCL07",
      "F00LAL01",
      "F00LAL02",
      "F00LAL03",
      "F00LAL04",
      "F00PSL01",
      "F00TPN02",
      "F00TPN03",
      "F01FPN01",
      "F01FPN02",
      "F01LPL01",
      "F01LPN01",
      "F02FPN01",
      "F03FPN02",
      "F03LPL01",
      "F03LPL02",
      "F04EAN01",
      "F04EAN03",
      "FC1LAN01",
      "IF0LAN01",
      "IF1LAN01",
      "N01FPN02",
      "N01FPN03",
      "N01FPN04",
      "N01IAN01",
      "N01LAL01",
      "N02FPN01",
      "N02FPN02",
      "N02FPN03",
      "N02FPN04",
      "N02FPN05",
      "N02FPN08",
      "N02FPN09",
      "N02LAN01",
      "PF0LAN01",
      "PF0LAN02",
      "PF0LAN03"
    ],
    "allowedStreams": [
      "gestion",
      "math",
      "techmath"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "general",
    "thresholdsByStream": {
      "gestion": 15.41,
      "math": 15.41,
      "techmath": 15.41
    },
    "sourceConfidence": "card-derived",
    "_note": "streams+threshold corrected to card (threshold=card.minAvg; inherited SCIENCES ECONOMIQUES bar (~10.0) too generous for elite stats school); previous registry-inherited values were unreliable",
    "_method": "card_derived_correction"
  },
  "esb": {
    "linkedProgramCodes": [
      "CF0LAN01",
      "CF0LAN03",
      "CF0LAN04",
      "CF0LAN05",
      "CF0LAN06",
      "CF1LPN01",
      "CF1LPN02",
      "CF1LPN03",
      "F00CAN01",
      "F00CAN02",
      "F00CAN03",
      "F00CAN06",
      "F00CAN08",
      "F00FCL01",
      "F00FCL02",
      "F00FCL03",
      "F00FCL04",
      "F00FCL05",
      "F00FCL06",
      "F00FCL07",
      "F00LAL01",
      "F00LAL02",
      "F00LAL03",
      "F00LAL04",
      "F00PSL01",
      "F00TPN02",
      "F00TPN03",
      "F01FPN01",
      "F01FPN02",
      "F01LPL01",
      "F01LPN01",
      "F02FPN01",
      "F03FPN02",
      "F03LPL01",
      "F03LPL02",
      "F04EAN01",
      "F04EAN03",
      "FC1LAN01",
      "IF0LAN01",
      "IF1LAN01",
      "N01FPN02",
      "N01FPN03",
      "N01FPN04",
      "N01IAN01",
      "N01LAL01",
      "N02FPN01",
      "N02FPN02",
      "N02FPN03",
      "N02FPN04",
      "N02FPN05",
      "N02FPN08",
      "N02FPN09",
      "N02LAN01",
      "PF0LAN01",
      "PF0LAN02",
      "PF0LAN03"
    ],
    "allowedStreams": [
      "gestion",
      "langues",
      "lettres",
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "general",
    "thresholdsByStream": {
      "sciexp": 10.0,
      "math": 10.0,
      "techmath": 10.08
    },
    "sourceConfidence": "medium",
    "_note": "linked via explicit grande-ecole code_fil; linked via admissions by_filiere filiere_key=SCIENCES ECONOMIQUES; thresholds from grande-ecole code_fil records",
    "_method": "explicit_codefil"
  },
  "esm": {
    "linkedProgramCodes": [
      "CF0LAN01",
      "CF0LAN03",
      "CF0LAN04",
      "CF0LAN05",
      "CF0LAN06",
      "CF1LPN01",
      "CF1LPN02",
      "CF1LPN03",
      "F00CAN01",
      "F00CAN02",
      "F00CAN03",
      "F00CAN06",
      "F00CAN08",
      "F00FCL01",
      "F00FCL02",
      "F00FCL03",
      "F00FCL04",
      "F00FCL05",
      "F00FCL06",
      "F00FCL07",
      "F00LAL01",
      "F00LAL02",
      "F00LAL03",
      "F00LAL04",
      "F00PSL01",
      "F00TPN02",
      "F00TPN03",
      "F01FPN01",
      "F01FPN02",
      "F01LPL01",
      "F01LPN01",
      "F02FPN01",
      "F03FPN02",
      "F03LPL01",
      "F03LPL02",
      "F04EAN01",
      "F04EAN03",
      "FC1LAN01",
      "IF0LAN01",
      "IF1LAN01",
      "N01FPN02",
      "N01FPN03",
      "N01FPN04",
      "N01IAN01",
      "N01LAL01",
      "N02FPN01",
      "N02FPN02",
      "N02FPN03",
      "N02FPN04",
      "N02FPN05",
      "N02FPN08",
      "N02FPN09",
      "N02LAN01",
      "PF0LAN01",
      "PF0LAN02",
      "PF0LAN03"
    ],
    "allowedStreams": [
      "gestion",
      "langues",
      "lettres",
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "general",
    "thresholdsByStream": {
      "sciexp": 10.0,
      "math": 10.0,
      "techmath": 10.08
    },
    "sourceConfidence": "medium",
    "_note": "linked via explicit grande-ecole code_fil; linked via admissions by_filiere filiere_key=SCIENCES ECONOMIQUES; thresholds from grande-ecole code_fil records",
    "_method": "explicit_codefil"
  },
  "ensa-agro": {
    "linkedProgramCodes": [
      "D00CAN06"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 13.87,
      "math": 14.58
    },
    "sourceConfidence": "medium",
    "_note": "linked via explicit grande-ecole code_fil; thresholds from grande-ecole code_fil records",
    "_method": "explicit_codefil"
  },
  "sm": {
    "linkedProgramCodes": [
      "B00LAL01",
      "B00LAL02",
      "B00LAL03",
      "B02IPN01"
    ],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 10.02
    },
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=SCIENCES DE LA MATIERE; linked via admissions by_filiere filiere_key=PHYSIQUE",
    "_method": "catalog_averages"
  },
  "ens": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "langues",
      "lettres",
      "math",
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "langues": 12.5,
      "lettres": 12.5,
      "math": 12.5,
      "sciexp": 12.5
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "sciences-po": {
    "linkedProgramCodes": [
      "G01LAL01",
      "G01LAL02",
      "G01LAL03",
      "G01LAN01",
      "GG0LAN01",
      "GG0LAN02",
      "GH0LAN01",
      "HG0LAN01",
      "IG0LAN01"
    ],
    "allowedStreams": [
      "arts",
      "gestion",
      "langues",
      "lettres",
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      29,
      30,
      31,
      32,
      33,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "general",
    "thresholdsByStream": {
      "sciexp": 10.0,
      "math": 10.0,
      "techmath": 10.48
    },
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=SCIENCES POLITIQUES",
    "_method": "catalog_averages"
  },
  "traduction": {
    "linkedProgramCodes": [
      "H03IAL01",
      "H03IAL02",
      "H03IAL03",
      "H03IAL04",
      "H03IAL05",
      "H03IAL09",
      "H03IAL10",
      "H03IAL13",
      "H03IAL14",
      "H03IAL15",
      "H03IAL16",
      "H03IAL17",
      "H03IAL18",
      "H03IAL19",
      "H03IAL20",
      "H03IAL21",
      "H03IAL22",
      "H03IAL23",
      "H03IAL24",
      "H03IAL25",
      "H03IAL26",
      "H03IAN07",
      "H03IAN08",
      "H03IAN11",
      "H03IAN12"
    ],
    "allowedStreams": [
      "langues",
      "lettres"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      2,
      3,
      6,
      8,
      11,
      12,
      13,
      17,
      19,
      20,
      21,
      22,
      23,
      24,
      26,
      27,
      31,
      32,
      33,
      37,
      39,
      41,
      45,
      46,
      47,
      48,
      52,
      57,
      58
    ],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {},
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=TRADUCTION",
    "_method": "catalog_averages"
  },
  "commu": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "gestion",
      "langues",
      "lettres"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "gestion": 10.02,
      "langues": 10.02,
      "lettres": 10.02
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "charia": {
    "linkedProgramCodes": [
      "I02PSL01",
      "I20LAL01",
      "I20LAL02",
      "I20LAN01"
    ],
    "allowedStreams": [
      "arts",
      "gestion",
      "langues",
      "lettres",
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      20,
      21,
      22,
      23,
      26,
      28,
      29,
      30,
      31,
      32,
      33,
      35,
      37,
      38,
      39,
      40,
      42,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "general",
    "thresholdsByStream": {
      "sciexp": 10.0,
      "math": 10.45
    },
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=SCIENCES ISLAMIQUES",
    "_method": "catalog_averages"
  },
  "sciences-hum": {
    "linkedProgramCodes": [
      "CI1LPN01",
      "CI1LPN02",
      "CI1LPN03",
      "I03FCL01",
      "I03FCL02",
      "I03FCL03",
      "I03LAN01",
      "I03LAN02",
      "I12LAN01",
      "I14LAN01",
      "I14LAN02",
      "I17LAL01",
      "I17LAL02",
      "I17LAL03"
    ],
    "allowedStreams": [
      "arts",
      "langues",
      "lettres",
      "sciexp"
    ],
    "scope": "mixed",
    "circleWilayaNums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58
    ],
    "rankingBasis": "general",
    "thresholdsByStream": {
      "sciexp": 10.0,
      "math": 10.08
    },
    "sourceConfidence": "high",
    "_note": "linked via admissions catalog_averages filiere_key=SCIENCES HUMAINES",
    "_method": "catalog_averages"
  },
  "med-ai": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {},
    "sourceConfidence": "card-derived",
    "_note": "streams from curated catalog.js card; no admission data (future/pilot track) - thresholds intentionally empty",
    "_method": "card_derived"
  },
  "it-int": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {},
    "sourceConfidence": "card-derived",
    "_note": "streams from curated catalog.js card; no admission data (future/pilot track) - thresholds intentionally empty",
    "_method": "card_derived"
  },
  "space-tech": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {},
    "sourceConfidence": "card-derived",
    "_note": "streams from curated catalog.js card; no admission data (future/pilot track) - thresholds intentionally empty",
    "_method": "card_derived"
  },
  "quantum": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {},
    "sourceConfidence": "card-derived",
    "_note": "streams from curated catalog.js card; no admission data (future/pilot track) - thresholds intentionally empty",
    "_method": "card_derived"
  },
  "digital-agro": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {},
    "sourceConfidence": "card-derived",
    "_note": "streams from curated catalog.js card; no admission data (future/pilot track) - thresholds intentionally empty",
    "_method": "card_derived"
  },
  "ensta": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "math": 17.15,
      "sciexp": 17.15,
      "techmath": 17.15
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "ensee": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "math": 16.15,
      "sciexp": 16.15,
      "techmath": 16.15
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "hnsre": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "math": 15.64,
      "sciexp": 15.64,
      "techmath": 15.64
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "aeronautique": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "math": 15.45,
      "sciexp": 15.45,
      "techmath": 15.45
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "esgen": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "gestion",
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "gestion": 15.51,
      "math": 15.51,
      "sciexp": 15.51,
      "techmath": 15.51
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "essg": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "gestion",
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "gestion": 10.0,
      "math": 10.0,
      "sciexp": 10.0,
      "techmath": 10.0
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "escf": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "gestion",
      "math",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "gestion": 12.5,
      "math": 12.5,
      "techmath": 12.5
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "ese": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "gestion",
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "gestion": 13.74,
      "math": 13.74,
      "sciexp": 13.74,
      "techmath": 13.74
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "essaia": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "math": 15.4,
      "sciexp": 15.4
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "essb": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "math": 15.05,
      "sciexp": 15.05
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "isp": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 11.27
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "dental-prosthetist": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 16.99
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "psychomotricien": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "sciexp": 11.27
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "med-eco": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "math": 13.74,
      "sciexp": 13.74,
      "techmath": 13.74
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "med-psy": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "sciexp"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "math": 16.65,
      "sciexp": 16.65
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "tech-media": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "math": 16.69,
      "sciexp": 16.69,
      "techmath": 16.69
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  },
  "math-eco": {
    "linkedProgramCodes": [],
    "allowedStreams": [
      "gestion",
      "math",
      "sciexp",
      "techmath"
    ],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "weighted_or_general",
    "thresholdsByStream": {
      "gestion": 10.0,
      "math": 10.0,
      "sciexp": 10.0,
      "techmath": 10.0
    },
    "sourceConfidence": "card-derived",
    "_note": "thresholds/streams derived from curated catalog.js card (threshold=card.minAvg); no official registry row",
    "_method": "card_derived"
  }
};

  // --- clean 58-wilaya master list (from geographic-circles.json) ---
  var TW_WILAYAS = [
  {
    "num": 1,
    "ar": "أدرار"
  },
  {
    "num": 2,
    "ar": "الشلف"
  },
  {
    "num": 3,
    "ar": "الأغواط"
  },
  {
    "num": 4,
    "ar": "أم البواقي"
  },
  {
    "num": 5,
    "ar": "باتنة"
  },
  {
    "num": 6,
    "ar": "بجاية"
  },
  {
    "num": 7,
    "ar": "بسكرة"
  },
  {
    "num": 8,
    "ar": "بشار"
  },
  {
    "num": 9,
    "ar": "البليدة"
  },
  {
    "num": 10,
    "ar": "البويرة"
  },
  {
    "num": 11,
    "ar": "تمنراست"
  },
  {
    "num": 12,
    "ar": "تبسة"
  },
  {
    "num": 13,
    "ar": "تلمسان"
  },
  {
    "num": 14,
    "ar": "تيارت"
  },
  {
    "num": 15,
    "ar": "تيزي وزو"
  },
  {
    "num": 16,
    "ar": "الجزائر"
  },
  {
    "num": 17,
    "ar": "الجلفة"
  },
  {
    "num": 18,
    "ar": "جيجل"
  },
  {
    "num": 19,
    "ar": "سطيف"
  },
  {
    "num": 20,
    "ar": "سعيدة"
  },
  {
    "num": 21,
    "ar": "سكيكدة"
  },
  {
    "num": 22,
    "ar": "سيدي بلعباس"
  },
  {
    "num": 23,
    "ar": "عنابة"
  },
  {
    "num": 24,
    "ar": "قالمة"
  },
  {
    "num": 25,
    "ar": "قسنطينة"
  },
  {
    "num": 26,
    "ar": "المدية"
  },
  {
    "num": 27,
    "ar": "مستغانم"
  },
  {
    "num": 28,
    "ar": "المسيلة"
  },
  {
    "num": 29,
    "ar": "معسكر"
  },
  {
    "num": 30,
    "ar": "ورقلة"
  },
  {
    "num": 31,
    "ar": "وهران"
  },
  {
    "num": 32,
    "ar": "البيض"
  },
  {
    "num": 33,
    "ar": "إليزي"
  },
  {
    "num": 34,
    "ar": "برج بوعريريج"
  },
  {
    "num": 35,
    "ar": "بومرداس"
  },
  {
    "num": 36,
    "ar": "الطارف"
  },
  {
    "num": 37,
    "ar": "تندوف"
  },
  {
    "num": 38,
    "ar": "تيسمسيلت"
  },
  {
    "num": 39,
    "ar": "الوادي"
  },
  {
    "num": 40,
    "ar": "خنشلة"
  },
  {
    "num": 41,
    "ar": "سوق أهراس"
  },
  {
    "num": 42,
    "ar": "تيبازة"
  },
  {
    "num": 43,
    "ar": "ميلة"
  },
  {
    "num": 44,
    "ar": "عين الدفلى"
  },
  {
    "num": 45,
    "ar": "النعامة"
  },
  {
    "num": 46,
    "ar": "عين تموشنت"
  },
  {
    "num": 47,
    "ar": "غرداية"
  },
  {
    "num": 48,
    "ar": "غليزان"
  },
  {
    "num": 49,
    "ar": "تيميمون"
  },
  {
    "num": 50,
    "ar": "برج باجي مختار"
  },
  {
    "num": 51,
    "ar": "أولاد جلال"
  },
  {
    "num": 52,
    "ar": "بني عباس"
  },
  {
    "num": 53,
    "ar": "عين صالح"
  },
  {
    "num": 54,
    "ar": "عين قزام"
  },
  {
    "num": 55,
    "ar": "تقرت"
  },
  {
    "num": 56,
    "ar": "جانت"
  },
  {
    "num": 57,
    "ar": "المغير"
  },
  {
    "num": 58,
    "ar": "المنيعة"
  }
];

  /** Return the eligibility record for a catalog id, or null. */
  function twElig(catalogId) {
    return (TW_ELIG && Object.prototype.hasOwnProperty.call(TW_ELIG, catalogId))
      ? TW_ELIG[catalogId] : null;
  }

  /** Return the clean wilaya list [{num, ar}, ...]. */
  function twWilayaList() {
    return TW_WILAYAS.slice();
  }

  /** Arabic name for a wilaya number, or "". */
  function twWilayaName(num) {
    for (var i = 0; i < TW_WILAYAS.length; i++) {
      if (TW_WILAYAS[i].num === num) return TW_WILAYAS[i].ar;
    }
    return "";
  }

  /**
   * Is a bac stream allowed for this card?
   * Empty allowedStreams => unknown => return true (do not over-filter).
   */
  function twIsStreamAllowed(catalogId, streamCode) {
    var rec = twElig(catalogId);
    if (!rec) return true;
    var allowed = rec.allowedStreams || [];
    if (allowed.length === 0) return true;
    return allowed.indexOf(streamCode) !== -1;
  }

  /**
   * Is a wilaya eligible for this card?
   * national / empty circle => true; regional => wilayaNum in circleWilayaNums.
   */
  function twWilayaEligible(catalogId, wilayaNum) {
    var rec = twElig(catalogId);
    if (!rec) return true;
    var circle = rec.circleWilayaNums || [];
    if (rec.scope === "national" || circle.length === 0) return true;
    return circle.indexOf(wilayaNum) !== -1;
  }

  /**
   * Accessibility verdict for a user's average + stream.
   *   ineligible : stream not allowed for the card
   *   safe       : userAvg >= threshold + 1
   *   likely     : threshold - 1 <= userAvg < threshold + 1  (within +/- 1)
   *   risk       : userAvg < threshold - 1
   *   unknown    : no threshold for that stream
   */
  function twAccessibility(catalogId, userAvg, streamCode) {
    var rec = twElig(catalogId);
    var base = {
      status: "unknown",
      threshold: null,
      scope: rec ? rec.scope : "unknown",
      rankingBasis: rec ? rec.rankingBasis : null,
      note: ""
    };
    if (!rec) {
      base.note = "no eligibility record for this card";
      return base;
    }
    if (streamCode && !twIsStreamAllowed(catalogId, streamCode)) {
      base.status = "ineligible";
      base.note = "stream not allowed for this specialty";
      return base;
    }
    var thr = null;
    var t = rec.thresholdsByStream || {};
    if (streamCode && typeof t[streamCode] === "number") {
      thr = t[streamCode];
    }
    base.threshold = thr;
    if (typeof userAvg !== "number" || thr === null) {
      base.note = (thr === null)
        ? "no published threshold for this stream"
        : "no user average provided";
      return base;
    }
    if (userAvg >= thr + 1)      base.status = "safe";
    else if (userAvg >= thr - 1) base.status = "likely";
    else                         base.status = "risk";
    base.note = "compared to per-stream admission minimum (2025-2026)";
    return base;
  }

  // --- attach to global ---
  root.TW_ELIG = TW_ELIG;
  root.twElig = twElig;
  root.twWilayaList = twWilayaList;
  root.twWilayaName = twWilayaName;
  root.twIsStreamAllowed = twIsStreamAllowed;
  root.twWilayaEligible = twWilayaEligible;
  root.twAccessibility = twAccessibility;
})(typeof window !== "undefined" ? window : this);
