# Offline brief data

Run the renderer with Node 22.18+ and UTF-8 JSON. Unknown presentation needs can use hand-built HTML; this format is a starter, not a restriction on research depth.

```json
{
  "title": "Synthetic event delivery plan",
  "question": "How do we make failed event delivery visible?",
  "audience": "Engineering and product",
  "summary": "Add a visible failure state and bounded retry handling.",
  "scope": "Synthetic fixture; no live systems queried.",
  "updatedAt": "2026-10-06",
  "sections": [
    {"id": "behavior", "title": "What happens today", "paragraphs": ["A failed callback leaves the job pending."], "evidence": ["S1"], "details": ["A replay must retain the original event identity."]}
  ],
  "flows": [
    {"title": "Current delivery", "state": "current", "nodes": [
      {"id": "queue", "label": "Queue", "detail": "Owns pending events", "evidence": ["S1"]},
      {"id": "worker", "label": "Worker", "detail": "Processes delivery", "evidence": ["S1"]}
    ], "edges": [{"from": "queue", "to": "worker", "label": "event", "evidence": ["S1"]}]}
  ],
  "options": [{"name": "Keep current behavior", "benefit": "No build cost", "tradeoff": "Failures remain hard to diagnose", "confidence": "High for this synthetic example", "evidence": ["S1"]}],
  "plan": [{"title": "Expose failure state", "outcome": "People can see failed delivery", "dependsOn": "Agree on lifecycle", "check": "A synthetic failed callback is visible and recoverable"}],
  "questions": ["Who owns the retry policy?"],
  "sources": [{"id": "S1", "label": "Synthetic fixture", "locator": "fixture.ts:12 at synthetic revision", "retrievedAt": "2026-10-06", "origin": "synthetic", "note": "No live behavior verified"}]
}
```

Required: title, question, summary, scope, sections, sources. Each section needs a unique id, title, and nonempty paragraphs. Each source needs a unique id, label, locator, retrievedAt, and origin. Optional source url must be an http(s) address; local references stay plain text because absolute paths are not portable.

Optional: audience, updatedAt, flows, options, plan, questions. Every evidence ID must exist. Flow state is current, proposed, or unknown. Nodes have unique IDs and label/detail; edges must point to real nodes, with a nonempty label. Optional node/edge evidence maps uncertainty to the exact transition. The renderer supports at most eight nodes per flow; split complex flows or use a custom diagram instead of dropping detail. Main path and exception branches use the same edges; node order controls layout.

All content is plain text. Markdown and raw HTML are escaped. No arbitrary script, CSS, or remote embedding fields are supported. For a feature brief, add sections for domain, current experience, proposed behavior, constraints, alternatives, migration, and acceptance examples where relevant. Keep private evidence out of the JSON, not only out of the visible summary.
