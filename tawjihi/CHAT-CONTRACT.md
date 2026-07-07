# Tawjihi AI Chat — Output Contract (v2)

The single source of truth shared by the **AI backend** (`api/tawjihi-chat.js`) and the
**frontend renderer** (`tawjihi/app.js` + `tawjihi/styles/app.css`). Both sides MUST
implement this exact protocol. Model: Groq Llama 3.3-70B (kept).

## 1. Response shape

The model emits a response that is **GitHub-flavored Markdown** for all prose, PLUS zero
or more **fenced directive blocks** for rich components. The frontend:

1. Streams raw text (typing effect ok).
2. On stream completion: **extracts every fenced directive block, REMOVES it from the
   text**, renders the remaining Markdown, then appends the rich components (in the order
   the blocks appeared) after the prose.
3. **A raw fenced JSON block must NEVER be visible to the user.** (This is the current bug.)

## 2. Markdown the renderer MUST support

- `##` / `###` headings
- `**bold**`, `*italic*`
- `- ` bullet lists, `1. ` numbered lists (with nesting one level)
- paragraphs + line breaks
- `---` horizontal rule
- `> ` blockquote → rendered as a styled callout
- `[text](speciality.html?id=ID)` internal links only
- `` `inline code` `` (rare)
- Plain emoji pass through

Everything is RTL Arabic-first. Use the existing design tokens in `styles/tokens.css`
(`--primary`, `--accent`, `--surface`, `--text`, `--text-muted`, `--cat-*`, radii, shadows,
fonts Tajawal/Pattaya). Invent no new colors.

## 3. Directive blocks

### 3a. ```spec-cards``` (EXISTING — keep)
```spec-cards
[{"id":"med","name":"طب","meta":"طب وصحة · علوم تجريبية","avg":"16.65","color":"var(--cat-medical)"}]
```
Only emit ids that exist in the catalog. Renders the existing `.chat-spec-card` row.

### 3b. ```compare``` (NEW) — side-by-side comparison table
Emit when the user compares 2+ specialities.
```compare
{
  "title": "مقارنة بين طب وصيدلة",
  "fields": [
    {"key":"avg","label":"معدل القبول 2025"},
    {"key":"streams","label":"الشعب المقبولة"},
    {"key":"duration","label":"مدة الدراسة"},
    {"key":"careers","label":"أبرز فرص العمل"}
  ],
  "items": [
    {"id":"med","name":"طب","avg":"16.65","streams":"علوم تجريبية، رياضيات","duration":"7 سنوات","careers":"طبيب عام، أخصائي بعد الريزيدانا"},
    {"id":"pharm","name":"صيدلة","avg":"16.26","streams":"علوم تجريبية، رياضيات","duration":"5 سنوات","careers":"صيدلاني، صناعة دوائية"}
  ]
}
```
Renderer: build an RTL table, header row = item names, left column = field labels.
**Defensive override:** if an item has an `id` present in the local catalog, the renderer
OVERRIDES its `avg` from the authoritative catalog data (never trust LLM arithmetic for
averages). Other fields render as the model wrote them.

### 3c. ```verdict``` (NEW) — personalized eligibility verdict
Emit when the user asks "can I get into X / am I eligible for X / حتقبل في X".
The model emits ONLY the speciality id (and stream if relevant) — **the frontend computes
the verdict locally** from the student's profile + authoritative thresholds. Do NOT trust
the LLM to compute status/threshold.
```verdict
{"id":"med"}
```
Renderer:
- Load `eligibility.js` (add the `<script>` to app.html). Read `tw-profile` for the
  student's `average`, `weightedAverages`, `stream`.
- Call `window.twAccessibility(id, effectiveAverage, stream)` → `{status, threshold, ...}`.
- Render a verdict box (status palette: safe=green, likely=amber, risk=red, ineligible=grey,
  unknown=grey) showing: status label (في المتناول / على الحدّ / طموح / غير متاح لشعبتك /
  بيانات غير متوفرة), the threshold (العتبة), the student's effective average, and a one-line
  note. Reuse the `--acc-*` palette already defined in `styles/spec-browser.css`.
- If `eligibility.js` or profile is missing, render nothing for the block (graceful).

## 4. System-prompt rules for the model (backend)

- Answer in the SAME language as the question (AR / FR / darija), warm big-brother darija tone.
- Use Markdown structure: short intro line, then `###` sub-sections or bullet lists. NEVER a
  single undifferentiated wall of text.
- Ground every number in the provided KB rows. Never invent an average or a university.
- End substantive recommendations with the honesty line about confirming on the official portal
  (the frontend ALSO appends a standard disclaimer — keep the model's brief).
- Emit a directive block ONLY when it adds value; otherwise plain Markdown.
- Directive blocks go at the END of the message, each on its own fenced block, valid JSON.

## 5. Parser robustness (frontend)

- Match blocks with a tolerant regex: ```` ```(spec-cards|compare|verdict)\s*\n([\s\S]*?)\n?``` ````.
- `JSON.parse` inside try/catch; on parse failure, DROP the block silently (never show raw).
- Strip ALL matched blocks from the prose before Markdown rendering, even malformed/partial
  ones (so a half-streamed fence at the end can't leak).
- Tolerate the model using `~` , extra spaces, or a missing trailing newline before ```` ``` ````.
