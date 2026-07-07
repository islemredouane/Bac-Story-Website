# Tawjihi ↔ BAC Story — Weighted-Average Integration Design

**Status:** Design proposal for director approval. DESIGN ONLY — no production code in this document.
**Owner:** Integration Architect
**Date:** 2026-06-21

---

## 0. Decision being designed

The director has decided that the **weighted average (المعدل الموزون)** — the per-field average that weights the
general BAC average against specific subject marks per official MESRS rules — is **NOT computed inside Tawjihi**.

- **BAC Story** (the parent site) is where the student enters subject marks. It computes the averages.
- **Tawjihi** (the orientation sub-app) **consumes** the result and uses it only to rank/colour programs.

This document specifies the full handoff: data contract, transport, Tawjihi-side changes, the BAC Story
calculator scope, security, and a phased rollout.

### Key existing facts this design is built on (verified in repo)

- The parent site **already has** a stream-level weighted calculator: `components/calculator.js`
  (loaded only on `tools.html`). It defines `coefficients` per stream (`math`, `science`, `tech`,
  `management`, `literature`, `languages`) and computes a coefficient-weighted average from subject marks.
  **This is the natural home for the export feature** — the math already exists.
- Tawjihi onboarding stores a profile under `localStorage['tw-profile']`
  (`tawjihi/onboarding.js`, key `STORE_KEY = 'tw-profile'`) with fields:
  `stream, average, wilaya, interests, ambition, ambitionText, completed, name`.
- On finish, onboarding POSTs to `/api/tawjihi-profile`, which upserts the `profiles` table
  (`tawjihi/db.sql`) using a **service-role** key server-side and Supabase Auth bearer token from the client.
- The catalog (`tawjihi/catalog.js`) carries per-program thresholds: `avg` (acceptance avg ~ 2025),
  `minAvg`, `avgHistory[].y2024/y2025`, and `streamCodes` (`sciexp|math|tech|...`). Accessibility today is a
  **single** comparison: `s.avg` vs the user's one `profile.average` (see `tawjihi/specialities.html` filter
  `matchAvg = s.avg >= state.avgMin && s.avg <= state.avgMax`).
- Stream label → code map already exists: `STREAM_MAP` in `specialities.html`
  (`'علوم تجريبية' → 'sciexp'`, `'رياضيات' → 'math'`, …).
- **Both apps share ONE Supabase project** (`vfjjrpzdyvawthvkwelr.supabase.co`) — confirmed in
  `tawjihi/supabase.js` and `.env.example`. They deploy to separate domains but the backend is the same.
- The guide data files referenced below (`tawjihi/data/guide/eligibility-matrix.json`,
  `weighted-formulas.json`, `programs.json`) are being produced by a parallel agent;
  `tawjihi/data/guide/` exists but is currently empty. This design references them by path and key shape.

> ⚠️ **Security pre-flight finding (must fix regardless of this feature):** `tawjihi/supabase.js` currently
> hard-codes a value labelled "anon key" that is actually a **`sb_secret_...` key**. A `sb_secret` key is a
> **server-side secret**, not the publishable/anon key, and must never ship in client JS. This needs to be
> swapped for the real publishable (anon) key before any of the storage-based transport below is safe. Flagged
> here because the chosen transport relies on the anon key being genuinely anon. (Out of scope to fix in this
> doc, but blocking for Phase 2.)

---

## A. Weighted-average data contract

### A.1 Field-code vocabulary

Three code spaces meet here. The contract pins them so producer and consumer agree:

| Concept | Code space | Source of truth | Examples |
|---|---|---|---|
| BAC stream | `streamCode` | `STREAM_MAP` / catalog `streamCodes` | `sciexp`, `math`, `tech`, `management`, `literature`, `languages` |
| Weighted-average **field** | `fieldCode` | `tawjihi/data/guide/weighted-formulas.json` (formula id) and `eligibility-matrix.json` | e.g. `medecine`, `pharmacie`, `eng_grande_ecole`, `informatique`, `droit`, `eco_gestion` … (final list owned by the guide files) |
| Program | `programId` / catalog `id` | `tawjihi/data/guide/programs.json` + `catalog.js` `id` | `pharm-ind`, `med-bio`, `med-info` … |

The **weighted-average field** (`fieldCode`) is the unit the director cares about: MESRS computes a *different*
weighted average per family of programs (medicine weights bio/chem; engineering weights math/physics; etc.).
Each program in `programs.json`/`catalog.js` must declare **which `fieldCode` its threshold should be compared
against** (see §C.3). The set of `fieldCode`s and their formulas live in `weighted-formulas.json` — Tawjihi
treats that file as opaque truth and never re-derives a formula.

### A.2 JSON shape (`schemaVersion: 1`)

```jsonc
{
  "schemaVersion": 1,
  "source": "bac-story",
  "issuedAt": "2026-07-21T09:14:00Z",     // ISO 8601, UTC
  "student": {
    "bacYear": 2026,                       // integer
    "stream": "علوم تجريبية",              // human label (matches onboarding option text)
    "streamCode": "sciexp",                // canonical code (STREAM_MAP value)
    "wilaya": "وهران",                      // matches onboarding <select> options
    "generalAverage": 14.62                 // المعدل العام, /20, 2 decimals — THE ONLY REQUIRED average
  },
  "weightedAverages": {                     // map fieldCode -> weighted average /20
    "medecine":          15.10,
    "pharmacie":         14.95,
    "eng_grande_ecole":  14.20,
    "informatique":      14.05,
    "eco_gestion":       13.80
  },
  "weightedFormulasVersion": "guide-2026.1", // which weighted-formulas.json produced these
  "rawSubjectMarks": {                       // OPTIONAL — for transparency / recompute / audit
    "math": 16.0, "science": 15.5, "physics": 14.0, "arabic": 13.0,
    "english": 12.5, "french": 11.0, "philo": 12.0, "islamics": 14.0,
    "history-geo": 13.0, "sport": 16.0, "tamazight": 15.0
  }
}
```

Field rules:

- `student.generalAverage` — **the only mandatory average.** Tawjihi must run with just this (see §A.3).
- `weightedAverages` — **optional map.** Keys MUST be `fieldCode`s present in `weighted-formulas.json`.
  Absent keys are normal (a literature student won't have `medecine`). Tawjihi must tolerate any subset,
  including `{}`.
- `streamCode` — canonical; `stream` (label) is advisory for display. If they disagree, `streamCode` wins.
- `rawSubjectMarks` — optional. Subject keys mirror the `coefficients` groups in `components/calculator.js`
  (e.g. `math`, `science`, `physics`, `arabic`…). Used only for "show your marks" UI and possible future
  client-side recompute; **never required** for ranking.
- `weightedFormulasVersion` — lets Tawjihi detect a contract built from an outdated formula set and warn.

### A.3 Graceful degradation (mandatory)

Tawjihi MUST function at every level of completeness:

| Available | Tawjihi behaviour |
|---|---|
| Full payload (general + weighted map + raw marks) | Per-field accessibility uses the correct weighted average per program; show "محسوب وفق المعدل الموزون". |
| General + partial `weightedAverages` | Use the weighted average where the program's `fieldCode` exists in the map; **fall back to `generalAverage`** for programs whose field is missing, with a subtle "تقديري" (estimate) marker. |
| General only (`weightedAverages` absent/`{}`) | Current behaviour: compare `generalAverage` vs `program.avg`. Mark all badges as "تقديري بالمعدل العام". |
| Nothing imported (onboarding `average` slider only) | Today's prototype behaviour, unchanged. The slider value is an **estimate**, clearly labelled as such. |

Rule: **a missing weighted average is never an error** — it is a downgrade to the general average, never a blank.

---

## B. Transport mechanism — RECOMMENDATION

### Evaluated options

1. **Shared Supabase table keyed by authenticated user** (write on BAC Story, read on Tawjihi).
2. **Import code / copy-paste JSON blob** (cross-domain, no shared backend assumed).
3. **Redirect with signed payload in the URL fragment** (`#...`, not query string).

### ✅ RECOMMENDATION: Option 1 — shared Supabase table, with Option 2 as an explicit fallback for unauthenticated/cross-account users.

**Why Option 1 wins here:** the two apps already share **one Supabase project and one auth system**
(`vfjjrpzdyvawthvkwelr`, confirmed). The expensive precondition for Option 1 (shared backend + shared auth)
is *already met*. That collapses the handoff to a normal authenticated DB read — the same pattern
`/api/tawjihi-profile` already uses. No personal data ever touches a URL. No copy-paste friction. It survives
the cross-domain split because Supabase Auth is domain-agnostic (the session token, not a cookie, authorizes
the read), and Tawjihi already calls the shared `/api/*` functions cross-origin (CORS `*` is set in
`vercel.json`).

#### How it works (server-side storage pattern, mirrors existing code)

1. Student logs in (same Supabase account) on BAC Story, enters marks on the calculator, clicks **"أرسل معدلي لتوجيهي"**.
2. BAC Story builds the §A.2 payload and POSTs it with the user's bearer token to a new
   serverless function `api/bac-averages.js` (sibling of `tawjihi-profile.js`). The function validates with
   the **service-role** key and upserts into a new table `bac_averages` keyed by `user_id` (schema in §C.1).
3. Student opens Tawjihi (separate domain, same login). Onboarding/dashboard calls
   `GET /api/bac-averages` with the same bearer token; the function returns the latest row.
4. Tawjihi merges it into `tw-profile` + the `profiles` table (§C).

#### Fallback: Option 2 (import code) — for the no-shared-account path

Not every BAC Story visitor will be logged into the same account they use on Tawjihi (or logged in at all). For
that case, BAC Story offers **"انسخ رمز معدلك"**: it base64url-encodes the §A.2 JSON and shows a short
copy-paste blob; Tawjihi onboarding has an **"ألصق رمز معدلك"** box that decodes and validates it. This needs
no backend and works fully cross-domain/offline. It is the only path that does not depend on shared auth, so it
is the universal floor.

#### Why NOT the others as primary

- **Option 2 as primary:** UX friction (copy-paste), and a pasted blob is trivially forgeable. Acceptable as a
  fallback for an *advisory* tool, but a poor default when a clean authenticated path exists.
- **Option 3 (signed URL fragment):** the fragment never reaches the server (good, beats query strings), but to
  prevent tampering you must HMAC-sign it, which means a server-side secret and a verify endpoint — at which
  point you've built most of Option 1's backend anyway, with worse UX and a redirect dance across domains. Only
  attractive if there were *no* shared backend. There is one. Rejected.

> **Hard rule applied:** personal data (marks, averages, wilaya) NEVER goes in a query string. Option 1 keeps it
> in authenticated server storage; the Option 2 fallback keeps it in a body/clipboard blob, not a URL.

---

## C. Tawjihi-side changes (specification — do not implement here)

### C.1 New Supabase table `bac_averages` (additive migration to `tawjihi/db.sql`)

```sql
create table if not exists public.bac_averages (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  schema_version     integer not null default 1,
  bac_year           integer,
  stream_code        text,
  general_average    numeric(4,2),                 -- the only guaranteed average
  weighted_averages  jsonb default '{}'::jsonb,    -- { fieldCode: number }
  raw_subject_marks  jsonb,                         -- optional
  formulas_version   text,
  source             text default 'bac-story',
  issued_at          timestamptz,
  updated_at         timestamptz default now()
);
alter table public.bac_averages enable row level security;
create policy "bac_averages: user owns all operations"
  on public.bac_averages for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger bac_averages_updated_at
  before update on public.bac_averages
  for each row execute function public.handle_updated_at();
```

Rationale for a **separate table** (vs. columns on `profiles`): the producer is a different app with a different
release cadence, the data is versioned, and `weightedAverages` is a variable-shape map. Keeping it isolated
avoids coupling Tawjihi's onboarding writes to BAC Story's export writes. `profiles` keeps a denormalized copy
of the few scalar fields Tawjihi reads most (below).

### C.2 Fields added to `tw-profile` (localStorage) and `profiles`

Extend the `tw-profile` object (currently `{stream, average, wilaya, interests, ambition, ambitionText, completed, name}`) with:

```jsonc
{
  "generalAverage": 14.62,           // authoritative imported general avg (overrides slider `average` when present)
  "weightedAverages": { "medecine": 15.10, "informatique": 14.05 },
  "bacYear": 2026,
  "wilaya": "وهران",                 // already exists; now may be set by import
  "averageSource": "imported"        // "imported" | "estimate"  — drives the "تقديري" labels
}
```

- Keep the existing `average` slider value as the **estimate fallback**; `generalAverage` (when present)
  takes precedence in all ranking. `averageSource` records which one is live.
- `profiles` table gains nullable columns mirroring the scalars Tawjihi reads hot:
  `bac_year integer`, `general_average numeric(4,2)`, `weighted_averages jsonb default '{}'`.
  (`wilaya` already exists.) The full record stays in `bac_averages`.

### C.3 Where the import happens

Two entry points, both idempotent:

1. **Onboarding (`tawjihi/onboarding.html` + `onboarding.js`):** add an optional first-class step / banner
   **"عندك معدلك من BAC Story؟ استوردو"**. On load, after auth, call `GET /api/bac-averages`; if a row
   exists, pre-fill and **skip/auto-fill** the average step, set `averageSource = "imported"`. If using the
   Option 2 fallback, render the paste box here.
2. **Dashboard (`tawjihi/dashboard.html`):** a persistent "حدّث معدلك من BAC Story" action so a student who
   onboarded with an estimate can import real marks after results day (2026-07-20 per `config.bac_results_date`).
   Re-import overwrites `generalAverage`/`weightedAverages` and flips `averageSource` to `imported`.

The import merge always writes both localStorage (`tw-profile`) and, when authenticated, the `profiles`
denormalized copy (via the existing `/api/tawjihi-profile` extended to accept the new fields, or a small
dedicated sync).

### C.4 Accessibility badges: per-field comparison (the core behaviour change)

Today: `accessible = userAverage >= program.avg` (one average for everything). This is wrong once weighted
averages exist, because each program is admitted on a *different* weighted average.

New rule — **each program must know which weighted-average key to use:**

1. Every program in `programs.json` / `catalog.js` declares `fieldCode` (the `weighted-formulas.json` key its
   `avg`/`minAvg` thresholds are expressed in). Programs that historically used the general average declare
   `fieldCode: "general"`.
2. Comparison function (conceptual):

   ```
   function effectiveAverage(program, profile):
       key = program.fieldCode
       if key != "general" and profile.weightedAverages[key] exists:
           return { value: profile.weightedAverages[key], source: "weighted" }
       if profile.generalAverage exists:
           return { value: profile.generalAverage, source: "general" }
       return { value: profile.average /* slider */, source: "estimate" }
   ```

3. Badge tiers (advisory, three bands) computed from `effectiveAverage.value` vs `program.avg`/`minAvg`:
   - **آمن / متاح** — `value >= program.avg`
   - **قريب / ممكن** — `minAvg <= value < program.avg`
   - **طموح / صعب** — `value < minAvg`
   - Each badge carries a small source tag: `موزون` (weighted), `عام` (general fallback), or `تقديري` (estimate).

4. The list filter in `specialities.html` (`matchAvg`) and any sort switch from comparing the single
   `state.avgMin/Max` against `s.avg`, to comparing **`effectiveAverage(s, profile).value`** — so the same
   student sees medicine ranked on their `medecine` weighted avg and CS on their `informatique` weighted avg,
   simultaneously.

### C.5 Graceful-degradation path (restate, code-level)

`effectiveAverage` above is the single choke point that guarantees §A.3: it walks weighted → general →
estimate and always returns a value + a `source`. No call site ever sees "no average". The only UI difference
across degradation levels is the source tag and a one-line disclaimer.

---

## D. BAC Story-side calculator (scope sketch)

**Where it lives:** extend the existing `components/calculator.js` (already on `tools.html`, already holds the
per-stream `coefficients`). Do **not** build a new calculator — add an **export step** to the one that exists.

Scope:

1. **Inputs:** the subject-mark inputs already rendered per stream on `tools.html`
   (`<field>-<subject>-grade`). Reuse them as-is.
2. **General average:** already computed by `calculateAverage(field)` — reuse, surface as `generalAverage`.
3. **Per-field weighted averages:** new step. Load `tawjihi/data/guide/weighted-formulas.json`; for each
   `fieldCode` whose formula applies to the student's stream, compute the weighted average from the entered
   subject marks **using the formula file as the only source of weights** (do not hard-code MESRS rules in JS —
   read them from the file the parallel agent owns). Produce the `weightedAverages` map.
4. **Build payload:** assemble the §A.2 object (`schemaVersion: 1`, stream, streamCode via the shared map,
   wilaya from a small added selector or existing profile, `bacYear`, the two average sets, optional raw marks,
   `weightedFormulasVersion`).
5. **Trigger transport (both):**
   - **Primary (Option 1):** if logged in, `POST /api/bac-averages` with bearer token → success toast
     "تم إرسال معدلك إلى توجيهي"; optionally deep-link to `tawjihi` domain onboarding.
   - **Fallback (Option 2):** "انسخ رمز معدلك" → base64url(JSON) to clipboard for manual paste into Tawjihi.
6. **New serverless function** `api/bac-averages.js` (sibling of `tawjihi-profile.js`, same auth/CORS/
   service-role pattern): `POST` validates + upserts `bac_averages`; `GET` returns the caller's row. Reuses the
   exact `getUser(req)` bearer pattern already in `tawjihi-profile.js`.

A small shared module (e.g. `tawjihi/data/guide/weighted-formulas.json` + a tiny pure `applyFormula(marks,
formula)` helper) keeps producer and consumer using the identical formula source, so an updated formula file
changes both apps at once.

---

## E. Security & privacy checklist

- [ ] **No personal data in URL query strings.** Enforced: Option 1 uses authenticated body/storage; Option 2
      fallback uses a clipboard blob, not a URL. Option 3 (which would have used the fragment) is rejected.
- [ ] **Auth for cross-origin reads.** `GET /api/bac-averages` requires a valid Supabase bearer token and
      returns **only** `auth.uid()`'s row (RLS + service-role check, identical to `tawjihi-profile.js`). The
      cross-domain split is safe because authorization rides the token, not a same-site cookie.
- [ ] **Anon vs service-role keys.** Anon/publishable key may ship in client JS (RLS-enforced); `service_role`
      stays server-only in Vercel env (`SUPABASE_SERVICE_ROLE_KEY`, already the pattern). **BLOCKER:**
      `tawjihi/supabase.js` currently embeds an `sb_secret_...` key in client code — must be replaced with the
      real publishable key before Phase 2 ships (see pre-flight note in §0).
- [ ] **Integrity / forgeability of imported averages.** A student *can* forge a higher average:
      Option 2's pasted blob is unsigned, and even Option 1's stored value originates from client-entered marks.
      **Decision: accept it.** Tawjihi is an **advisory** orientation tool, not an admissions gate — inflating
      your own number only misleads yourself. So we do **not** add HMAC signing or server-side mark
      re-verification now (that complexity buys nothing for an advisory product). We DO:
  - validate ranges server-side (each average ∈ [0,20], `bacYear` plausible, `fieldCode`s ∈ known set) to
    reject malformed/abuse payloads;
  - store `source` + `issuedAt` so a future "verified results" feed (real MESRS data) can supersede
    self-entered values without a schema change.
- [ ] **Minimal data.** Store only what ranking needs; `rawSubjectMarks` is optional and may be omitted by the
      producer to reduce stored PII.
- [ ] **CORS** already constrained to the needed methods/headers in `vercel.json`; the new function inherits it.

---

## F. Phased rollout ("data foundation first", degrading gracefully at every step)

**Phase 0 — Foundation (no user-visible change).** Land the guide data files
(`eligibility-matrix.json`, `weighted-formulas.json`, `programs.json`) and add `fieldCode` to every program in
`programs.json`/`catalog.js` (default `"general"`). Tawjihi behaviour unchanged (still general-avg). *Degrades:
fully — nothing depends on it yet.*

**Phase 1 — Consumer-ready, still general-only.** Implement `effectiveAverage()` and the per-field badge tiers
in Tawjihi reading from `weightedAverages`. With no imports yet, every program resolves to general/estimate —
identical UX to today, but the comparison machinery is in place. *Degrades: this IS the degraded path.*

**Phase 2 — Authenticated transport (Option 1).** Add `bac_averages` table + `api/bac-averages.js`, the BAC
Story export step in `components/calculator.js`, and the Tawjihi import in onboarding/dashboard. **Fix the
client key first (§E blocker).** Now logged-in students get real weighted badges; everyone else still gets
general/estimate. *Degrades: missing/partial weighted map → general fallback per §A.3.*

**Phase 3 — Fallback transport (Option 2) + dashboard re-import.** Add the copy-paste import code for
unauthenticated/cross-account users and the post-results "update my average" dashboard action (timed to
`config.bac_results_date`). *Degrades: paste optional; skipping it leaves you on Phase-2 behaviour.*

**Phase 4 — Hardening / future.** Optional: ingest a verified MESRS results feed that supersedes self-entered
values via the existing `source`/`issuedAt` fields; optional client-side recompute from `rawSubjectMarks` for
transparency. Purely additive.

Each phase ships independently and never regresses a student who stops at an earlier phase.

---

## Appendix — minimal example payloads

**Science student, full payload (Phase 2+):** see §A.2.

**Literature student, general-only (graceful degrade):**

```json
{
  "schemaVersion": 1,
  "source": "bac-story",
  "issuedAt": "2026-07-21T09:20:00Z",
  "student": {
    "bacYear": 2026, "stream": "آداب وفلسفة", "streamCode": "literature",
    "wilaya": "قسنطينة", "generalAverage": 12.40
  },
  "weightedAverages": {},
  "weightedFormulasVersion": "guide-2026.1"
}
```

Tawjihi consumes this fine: all programs resolve via `generalAverage`, badges tagged `عام`.
