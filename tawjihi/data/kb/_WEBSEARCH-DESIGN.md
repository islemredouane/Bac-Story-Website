# Web-Search Augmentation Design — Tavily fallback in `api/tawjihi-chat.js`

Optional internet search that fills KB gaps (news about new schools, current-year
calendar changes, school websites). **Key-gated:** the entire feature is inert
unless `TAVILY_API_KEY` is set — with the key absent, the chat flow is
byte-identical to before.

## Provider

- Tavily — `POST https://api.tavily.com/search`
- Body: `{ api_key, query, max_results: 3, search_depth: "basic", include_domains? }`
- Query = the user's current message, truncated to 300 chars.

## Trigger conditions (max one search per request)

The search runs only when `TAVILY_API_KEY` is set AND at least one of:

1. **Low-confidence retrieval** — `retrieve()` now exposes `result.topScore`
   (the best speciality score). Search fires when `topScore < 6`
   (`WEB_SEARCH_SCORE_THRESHOLD`).
2. **Time-sensitive intent** — the message (or last 4 conversation turns)
   contains any of `TIME_SENSITIVE_SIGNALS`: التسجيلات 2026/٢٠٢٦، 2026/٢٠٢٦،
   رزنامة، موعد/مواعيد، آخر أجل، جديد/جديدة، أخبار، فتح تخصص(ات)، plus French
   equivalents (calendrier, date limite, deadline, nouveau/nouvelle, actualité).

Otherwise the request is untouched — zero extra HTTP calls.

### Why threshold = 6

On the existing `retrieve()` scoring scale:

| Signal | Points |
|---|---|
| Generic token overlap | +1 per token |
| Explicit name/fr/ar substring match | +12 |
| Name-token match (e.g. "طب") | +6 |
| ID-token match (e.g. "esi") | +4 |
| Intent boost (ENSIA) | +15 |
| Stream-fit boost | +2 / +3 |

A score ≥ 6 essentially guarantees a name-level match (or a dense overlap that
behaves like one) — the KB can answer, so searching wastes quota and latency.
Below 6, the top hit was matched by common-word overlap only (a few +1s plus
maybe a stream boost), meaning the KB has no entry for what was actually asked.
Note the existing AI-2 empty-context cutoff is `< 3`; the search threshold is
deliberately looser (3–5 = "weak fuzzy hit") because those answers were the
hallucination-prone ones.

## Domain preference

First call restricted via `include_domains` to official/reliable Algerian
sources: `mesrs.dz`, `inscription.mesrs.dz`, `aps.dz`, `*.edu.dz`, `*.dz`
(wildcards cover university sites). If that returns **zero** results, one
unrestricted retry runs — but both calls share the **same 3.5 s deadline**
(single `AbortController`), so worst-case wall-clock cost is unchanged.

## Failure handling

- Hard 3.5 s `AbortController` timeout on the whole search phase.
- Any error (timeout, HTTP error, bad JSON) → `webSearch()` returns `null`,
  logs `[web-search] skipped`, and the chat proceeds KB-only. The chat request
  can never fail because search failed.

## Prompt injection

Results (max 3) are rendered by `buildWebBlock()` into the system prompt,
after the guide block and before the id whitelist:

```
## نتائج بحث من الإنترنت (تحقق منها)
- **<title, ≤120 chars>** — <snippet, ≤350 chars>
  المصدر: <url>
⚠️ قواعد استعمال نتائج الإنترنت (إلزامية):
1. هذه النتائج ثانوية — قاعدة المعرفة أعلاه لها الأولوية دائماً عند أي تعارض.
2. إذا استعملت معلومة من نتيجة، اذكر مصدرها صراحة في ردك.
3. ممنوع منعاً باتاً أخذ أي معدل قبول أو رقم رسمي من هذه النتائج — الأرقام الرسمية من قاعدة المعرفة فقط.
```

This coexists with the pre-existing Gemini `googleSearch` tool (still enabled
only when retrieval returns empty); Tavily is what gives Groq/OpenRouter
fallbacks — which have no native search — the same capability.

## Cost / latency notes

- **Quota:** Tavily free tier = 1,000 searches/month. Triggers are narrow
  (low-score or time-sensitive only), so typical chat traffic consumes a small
  fraction; monitor `[web-search]` logs if volume grows.
- **Latency:** adds up to 3.5 s (typically ~0.5–1.2 s for `basic` depth)
  before the first streamed token, only on triggered requests. Non-triggered
  requests: 0 ms added.
- **Tokens:** injected block ≤ ~500 tokens (3 × title+snippet+URL + rules).
- **HTTP calls:** 0 when not triggered; 1 typical; 2 only when the
  domain-restricted call returns empty (still within the one 3.5 s budget).
