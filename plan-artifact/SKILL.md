---
name: plan-artifact
description: "Turn research, architecture notes, or a feature plan into a detailed standalone HTML explanation with rendered flow diagrams, evidence links, expandable detail, and verifiable next steps. Use when the user wants a visual research or planning artifact."
license: MIT
---

# Plan artifact

Create a useful reading surface for a plan, not a marketing page. This packages existing evidence; do not invent research or silently implement the plan. Existing artifact/upload skills remain optional tools for rendering or requested sharing.

## Inputs and output

Take notes, research, a source bundle, or an existing artifact and the intended audience. Return a standalone HTML file and editable source JSON/Markdown. Default to the task's artifact folder; do not place generated files inside installed skill directories. Adapt the visual system from an existing artifact if provided.

## Build

1. Decide what the reader must understand or decide. Put the conclusion and evidence/access limits at the top. Lead with the domain and user outcome; technical details follow.
2. Keep current behavior, proposed behavior, unknowns, and historical decisions distinct in prose and diagrams. Use concrete synthetic examples. Attach evidence IDs to material claims and transitions.
3. Show rendered diagrams: system/data flow, user journey, sequence, or phased plan as useful. Label edges with what moves or triggers the transition. Include important errors/retries and boundaries. Keep a text equivalent for accessibility and small screens. Label a timeline as proposed if dates are estimates.
4. Write full explanations, tradeoffs and completion checks. Expandable sections carry depth; they are not a substitute for readable summary text. Tables suit comparable options. Use human language and explain acronyms.
5. Render with the bundled offline helper for a reliable starting point, or hand-build HTML when the question needs a different diagram/layout. Read [artifact-format.md](artifact-format.md) for the helper's data format:

```bash
node <skill-dir>/scripts/render-brief.ts --input brief.json --output brief.html
```

The helper validates the data, escapes source text, renders flow nodes/edges as inline SVG, and includes navigation, detail toggles, print styling, and source anchors. It has no dependencies, CDN calls, or telemetry. It creates a new file; change the filename instead of overwriting a prior revision.

6. Inspect the rendered artifact with available browser tools at desktop and narrow widths. Check clipped labels, arrows, citations, keyboard use, expandable details and print. Without a browser, run structural checks and report that visual review remains unverified. Do not call plain Mermaid source a rendered diagram.

## Privacy and scope

Only synthetic, aggregate or appropriately redacted content belongs in a shared artifact. External/customer data must not go to third-party AI/rendering services. Verify source and link content before sharing; escaping prevents code execution, not sensitive-data leaks. Publish/upload or send messages only when requested. A request to create HTML does not authorize an upload.

## Stopping condition

Finish when the file opens without external resources, diagrams explain the actual plan, important claims can be traced, and the reader can identify the next action and how success will be checked. Give the artifact/source links and any material evidence or rendering limits. Do not claim planned checks have run.
