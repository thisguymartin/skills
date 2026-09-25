# Artifact Types

Per-type recipes for the nine HTML artifact shapes referenced by the `scribble` skill. Load only the row that matches the chosen type; do not load the full file unless the type is ambiguous.

Every type follows the global rules from the parent `SKILL.md` — single self-contained HTML file, inline CSS/JS, `./html-artifacts/<topic>-<YYYY-MM-DD>.html`, visible Sources section, synthetic data only, no persistence, no backend.

## Reasoning Scaffold (long-form only)

Types `report`, `research`, `plan`, and `walkthrough` must include three sections between the header/TL;DR and the body:

- **Problem breakdown** — 2-4 bullets framing what is broken, unclear, or at stake.
- **Approach** — one short paragraph stating the recommended path, plus a flow / timeline SVG when the change is non-trivial.
- **Alternatives** — 2-3 paths considered and rejected, each rendered as a `<dl>` row: name (italic `<dt>`) + one-line "why not" (`<dd>`).

Types `compare`, `tool`, `design`, `diagram`, `deck` are exempt — their structure already serves those purposes.

See `themes.md` for the visual treatment of these blocks in the `editorial` theme.

## compare

**Use when:** user wants to see N divergent approaches before committing — UI layouts, algorithm shapes, API designs, copy variants, data models, deployment topologies.

**Pre-build asks (only if not in prompt):**

1. What is being compared.
2. How many options (default 4, range 3-8).
3. Dimensions that should vary (layout, tone, density, complexity, cost, latency, lock-in, ergonomics).
4. The one-line tradeoff to label each option with.

**Required sections:**

- Header with topic and 1-2 sentence framing of the decision.
- Dimensions line listing the axes that vary.
- `<main class="grid">` of N `<article class="option">` cards. Each card has: option name, one-line `Tradeoff:` subtitle, dimensions row, embedded rendered mockup (not a screenshot, not a text description).
- Footer with 3-5 "Questions to ask yourself before picking" bullets.
- Sources section.

**Visual elements:**

- CSS Grid layout: `grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))`.
- Single-column collapse on narrow screens.
- For code comparisons: `<pre><code>` with Prism (CDN) for syntax highlighting.
- For data-shape comparisons: small table or JSON-formatted `<pre>` block.

**Rules:**

- Force divergence. If two options are near-identical, regenerate one with stronger contrast.
- Label every option with a one-line tradeoff explaining what it gives up.
- Never declare a winner or rank options. The user picks.
- Optional `Pick this one` button per card that copies a markdown summary to clipboard.

## walkthrough

**Use when:** the user wants a reviewer-friendly explainer of a PR, code change, or module — annotated diff, flow diagram, severity-coded findings.

**Pre-build asks:**

1. Target: PR number, branch diff, file/module, or commit range.
2. Audience: reviewer familiar with the code / new joiner / staff engineer / leadership.
3. Focus area: the single most important part to grok.
4. Render style: annotated diff, architecture flow, or both.
5. Severity coding (yes/no) — green/yellow/red callouts.

**Required sections:**

- Header with topic, TL;DR (3-4 sentences), audience, focus, files-touched count, +added / −removed lines.
- "What to focus review on" — 2-5 ranked bullets.
- "Walkthrough" — rendered diff with margin annotations and/or inline SVG flow.
- "Gotchas & open questions" — subtle behaviors, hidden assumptions, breaking changes.
- Footer with branch and SHA.
- Sources section.

**Visual elements:**

- `<pre><code>` blocks with Prism, one per hunk. Gutter color: green for additions, red for deletions, neutral for context.
- Margin annotations as floating `<aside>` elements positioned next to relevant lines.
- If severity coding is on, color the annotation border: `border-left: 4px solid {green|yellow|red}`.
- Inline SVG for architecture flow (no Mermaid here — Mermaid is for PR body markdown).

**Rules:**

- Read the actual code at the post-change SHA, not just the patch.
- Cite file paths and line numbers (post-change) in every annotation.
- Never recommend approve/reject — the reviewer decides.
- Render the actual diff, not a paraphrase, when annotated-diff mode is chosen.

## plan

**Use when:** user wants an implementation plan or spec rich enough to share with the team — milestones, data flow, mockups, code snippets, risk table.

**Pre-build asks:**

1. Scope and goal.
2. Constraints and non-goals.
3. Audience (myself / team / leadership).

**Required sections:**

- Header with goal and 1-2 sentence framing.
- Milestone timeline (horizontal or stacked, depending on scale).
- Data flow or system flow SVG showing the change shape.
- Mock UI screens if the work is user-facing.
- Annotated code snippets for the 2-4 most important slices.
- Risk table: risk, likelihood, mitigation.
- Decision points / open questions.
- Handoff section — see `Agent Handoff` in `../../scribble-research/references/artifact-patterns.md`.
- Sources section.

**Visual elements:**

- Inline SVG for flows and timelines.
- HTML/CSS mockups for UI screens — real rendered elements, not screenshots.
- Risk table with severity-tinted rows.

**Rules:**

- Lead with the goal and the success criteria.
- Separate confirmed facts from inference and assumptions.
- End with a handoff section the next agent or human can act on.

## design

**Use when:** user wants to prototype a UI element, animation, micro-interaction, or visual style — sliders/knobs to tune parameters, live preview, copy-the-config button.

**Pre-build asks:**

1. What is being prototyped (a button animation, a color palette, an easing curve, a card layout).
2. Which parameters should be tunable.
3. Initial values for those parameters.

**Required sections:**

- Header with topic.
- Live preview pane that re-renders as controls change.
- Control panel: sliders, color pickers, dropdowns, text inputs. Label each control with its parameter name and current value.
- Copy-as-X button(s): "Copy CSS", "Copy JSON config", "Copy prompt".
- Reset button that restores initial values.
- Sources section (often just `model inference`).

**Visual elements:**

- Vanilla JS event listeners. AlpineJS CDN allowed for small reactivity.
- CSS variables driven by JS for live updates.
- Visible live values next to each slider.

**Rules:**

- Pre-fill sensible initial values — never start with everything at zero.
- Copy button must be visible without scrolling.
- No build step. No framework setup beyond a single CDN tag.

## diagram

**Use when:** user wants a single self-contained illustration — flowchart, architecture diagram, sequence diagram, decision tree, user journey, ER diagram.

**Pre-build asks:**

1. What the diagram should show.
2. Style preference (sketchy / clean / technical).

**Required sections:**

- Header with topic.
- Inline SVG illustration filling most of the viewport.
- Caption describing what is being shown.
- Legend when symbols or colors carry meaning.
- Sources section.

**Visual elements:**

- Pure inline SVG, no Mermaid (Mermaid is for markdown PR bodies).
- Label every node and edge — no unlabeled lines.
- For flows with branching, render error/edge paths in a desaturated color so the happy path reads first.

**Rules:**

- One diagram per file — multiple diagrams on one page go in `research` or `plan` types instead.
- Diagram must fit on a single screen at common viewport sizes (1280×800 minimum).

## deck

**Use when:** user wants a slide-deck-style presentation — one idea per slide, arrow-key navigation, large headings, minimal body text.

**Pre-build asks:**

1. Topic and audience.
2. Approximate slide count.
3. Notes-mode required (presenter notes hidden under each slide)?

**Required sections:**

- Title slide with topic, presenter, date.
- N content `<section>` slides, one full-viewport each.
- Optional summary / "thanks" slide.
- Sources section (can be its own final slide).

**Visual elements:**

- CSS `scroll-snap-type: y mandatory` on the container, `scroll-snap-align: start` on each section.
- Arrow-key JavaScript handler to step between slides.
- Large heading per slide (clamp 32px-64px). 3-7 bullets max per slide.
- Optional slide counter in a corner.

**Rules:**

- No more than 7 bullets per slide.
- Each slide answers one question.
- No build step — this is a single HTML file, not Reveal.js.

## research

**Use when:** user wants a deep-dive explainer synthesized across multiple sources — feature explainer, incident write-up, learning artifact, market scan, weekly status.

**Pre-build asks:**

1. Topic / question. Be specific.
2. Sources (multi-select): codebase, git, user-provided files. Web/MCPs are opt-in per the parent SKILL.md hard gate.
3. Audience.
4. Depth: one-pager, long explainer, or slide-deck style.
5. SVG diagrams? Default yes for non-trivial flows.

**Required sections:**

- Header with topic, TL;DR (3-5 sentences answering the question), audience, sources used, generated date, table of contents.
- 3-10 sub-sections depending on depth, each focused on one question.
- Annotated code snippets with `file:line` citations.
- "Gotchas" section near the end.
- `<aside class="confidence">` listing claims with confidence levels and source links.
- Citations footer with numbered source list.

**Visual elements:**

- Inline SVG for diagrams, neutral palette consistent with the design system.
- `<pre><code>` with Prism for code blocks.
- Anchor links from the ToC to sections.

**Rules:**

- TL;DR answers the question, not restates it.
- Every non-trivial claim has a citation or confidence label.
- If multiple sources are gathered in parallel, the sub-agent prompts MUST be caveman full mode per `caveman-prompt-template.md`.
- Warn the user if they ask for more than 4 sources in one run — latency and noise compound.

## report

**Use when:** user wants a recurring document the team will actually read — status update, post-mortem, incident timeline, weekly recap.

**Pre-build asks:**

1. Reporting period or incident window.
2. Audience.
3. Sections needed (varies by report type).

**Required sections:**

- Header with period, audience, generated date.
- TL;DR with the key takeaway above the fold.
- Timeline of events (for incidents) or summary of work (for status reports).
- Simple chart if numeric data is involved — bar or line, plain SVG.
- "What changed" / "What slipped" / "Follow-up actions" depending on type.
- Sources section.

**Visual elements:**

- Horizontal timeline as inline SVG or as a styled `<ol>` with absolute-positioned markers.
- Simple bar/line chart in SVG — no external chart library.
- Status pills with semantic colors (shipped, slipped, blocked).

**Rules:**

- Lead with the takeaway, not the timeline.
- Numbers in the chart must reflect real values the user provided or that came from the gathered sources. If only inference, say so.
- Keep prose tight — readers skim reports.

## tool

**Use when:** user wants a throwaway editing interface — drag/reorder items, tune parameters, annotate a doc, multi-select buckets — that ends by exporting back to text.

**Pre-build asks:**

1. Data shape: paste JSON, point to a file, or describe records.
2. Operations: reorder/drag, edit fields, annotate, select/filter, slider-tune, color-pick, multi-select buckets.
3. Export format(s): JSON, markdown, prompt, diff, plain text.
4. Bucket/column names if reordering across columns.

**Required sections:**

- Header with topic and one-sentence instruction.
- Copy-as-X button(s) visible above the fold.
- Reset button.
- The editing UI itself.
- Sources section (usually `user-provided` + `model inference`).

**Visual elements:**

- Vanilla JS by default. Allowed CDNs (one max): SortableJS, AlpineJS, htmx.
- Pre-fill the data as a JS constant at the top of the script — do not ask the user to paste it again at runtime.
- Pre-sort items if the user gave a rough idea of priority.

**Rules:**

- No `localStorage` / `sessionStorage` / `IndexedDB` / cookies. Throwaway means throwaway.
- Copy button is the entire reason this artifact exists — never omit it.
- Reset button restores initial state.
- Drag-drop is hard on mobile — desktop-only is acceptable, note it in the artifact if so.
