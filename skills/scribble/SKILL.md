---
name: scribble
description: Use when a user asks for an HTML artifact, visual spec, interactive explainer, PR or code walkthrough, design comparison, prototype, deck, report, custom editor, or any shareable, re-readable output that would be too flat as Markdown.
license: MIT
---

# Scribble

Use one self-contained `.html` file when layout, visuals, interaction, or shareability will make the work easier to review than Markdown.

Do not use this for one-line answers, simple commit messages, short PR bodies, raw excerpts, or anything the user clearly wants inline in chat.

## Source Policy — Hard Web Gate

Sources are **local-only by default**. The skill must not call `WebSearch`, `WebFetch`, or any external MCP unless an explicit opt-in trigger fires for this run.

- **Default-on (always allowed):** local codebase, git history, files the user pasted, prior artifacts in `./html-artifacts/`, screenshots and other user-provided context.
- **Gated (opt-in only):** general web (`WebSearch`, `WebFetch`), Linear, Slack, Notion, Datadog, Mixpanel, Sentry, GitHub MCPs, and any other named external system.
- **Opt-in triggers:** the user passes `--web` / `--online` / `--internet`, says "search online", "use the web", "latest", "current", or names a specific external system ("check Linear", "search GitHub issues"). Naming a specific system opens the gate for that system only, not the general web. Full canonical list lives in `references/web-triggers.md`.
- **Ambiguity defaults to closed.** If the topic seems to need external data but no trigger fired, pause and ask in one sentence whether to open the gate. Do not infer consent from the topic alone.
- Label every claim as `local repo`, `user-provided`, `read-only MCP`, `web`, `model inference`, or `assumption`. No `web` entries appear unless the gate was opened.
- Include source freshness and confidence when facts are time-sensitive or recommendations depend on source quality.
- Never put real customer data in examples or generated artifacts. Use synthetic data.

## Pick The Artifact

Nine artifact types. Pick from the user's prompt; ask one disambiguating question only if two types tie. Per-type recipes — required sections, visual elements, build rules — live in `references/artifact-types.md`. Load only the row matching the chosen type.

| Type | Need | HTML shape |
| --- | --- | --- |
| `compare` | Explore N options before committing | Side-by-side grid, tradeoff label per card, no winner declared |
| `walkthrough` | PR or code review | Annotated diff, severity callouts, reviewer focus list, gotchas |
| `plan` | Implementation plan or spec | Timeline, data flow SVG, mock UI, risky code snippets, risk table |
| `design` | Prototype a UI element or interaction | Live preview, sliders/knobs, copy-config button, reset |
| `diagram` | Single self-contained illustration | Inline SVG filling viewport + caption + legend |
| `deck` | Slide-style presentation | One `<section>` per slide, arrow-key navigation, large headings |
| `research` | Deep-dive explainer across multiple sources | TL;DR, sectioned long-form, diagrams, annotated code, citations |
| `report` | Status, incident, post-mortem, weekly recap | Timeline, simple chart, what-changed / follow-ups |
| `tool` | Throwaway editing interface | Editable UI + copy-as-X export + reset |

Inferred default when nothing pins the type: `research`. Confirm the inferred choice in one sentence before generating.

## Routing

The skill is the router and the single entry point — every request lands here, regardless of the artifact shape the user wants.

1. **Auto-pin from keywords.** If the user prompt already names the shape, skip the question and confirm the pick in one sentence. Matches:
   - "compare", "side-by-side", "N options", "approaches" → `compare`
   - "walkthrough", "explain this PR", "annotate the diff", "review this change" → `walkthrough`
   - "drag to reorder", "tune with sliders", "annotate then export", "throwaway tool" → `tool`
   - "research", "deep dive", "synthesize", "explain how X works" → `research`
   - "status update", "weekly recap", "post-mortem", "incident", "migration report" → `report`
   - "implementation plan", "spec", "roadmap", "milestones" → `plan`
   - "deck", "slides", "presentation" → `deck`
   - "diagram", "flowchart", "architecture diagram" → `diagram`
   - "prototype", "tune the easing", "live preview" → `design`
2. **Otherwise ask one bucket question.** Five buckets cover the nine types:
   1. Compare options → `compare`
   2. Walkthrough code → `walkthrough`
   3. Interactive tool → `tool`
   4. Research / report / plan → disambiguate with one follow-up
   5. Other (diagram / deck / design prototype) → disambiguate with one follow-up
3. **Load only the matching row** from `references/artifact-types.md`. Do not read the full file.
4. **Pick a theme** per `references/themes.md` selection rules. Default `utilitarian`. Default `editorial` for `report` / `research` / `plan` / `walkthrough` when audience contains leadership / exec / CTO / CEO / board / investor. Honor `--theme editorial|utilitarian|minimal` or explicit user phrasing ("make it pretty" → editorial; "keep it plain" → utilitarian).
5. **One-line confirmation** before building: state the picked type, theme, and audience. Example: `Building report · editorial · audience CTO.`

## Build Workflow

1. Define the job: who will read it, what decision it supports, and what source set is being used.
2. If online lookup would materially improve the artifact and the user did not already ask for it, pause and say what lookup is needed.
3. Write a single valid HTML5 file under `./html-artifacts/<topic>-<YYYY-MM-DD>.html`.
4. Use inline CSS, inline JS, and inline SVG. No build step.
5. Put the main answer above the fold: conclusion, confidence, source coverage, and next action.
6. For long-form types (`report`, `research`, `plan`, `walkthrough`), include **Problem breakdown → Approach → Alternatives** between the header/TL;DR and the body. See `references/artifact-types.md` for the scaffold spec.
7. Apply the picked theme's tokens and layout patterns from `references/themes.md` inline at the top of the `<style>` block. Do not mix themes.
8. Make the body dense and scannable: tables, timelines, diagrams, tabs, scorecards, and controls beat long prose.
9. Add a visible source ledger and separate facts from inference, assumptions, gaps, and risks.
10. For custom editors, always include an export button that returns the edited state as Markdown, JSON, diff, or a next-agent prompt.
11. Validate before final response: file exists, no leftover placeholder text, title matches topic, source ledger is visible, and interactions have a no-JS fallback or clear static state.

## Visual Rules

- Reuse `./design-system.html` or `./html-artifacts/design-system.html` if present.
- Keep the first screen useful. Avoid marketing-style hero pages unless the user asked for one.
- Prefer restrained, readable UI: clear hierarchy, compact cards, tables, diagrams, and stable responsive layouts.
- Do not use decorative gradients or vague stock-like visuals when the user needs concrete inspection.
- Use inline SVG for diagrams and simple illustrations. Use bitmap assets only when they reveal the real product, place, person, or visual state.

## Caveman Under The Hood

Two distinct uses of caveman compression in this skill:

- **Sub-agent prompts (required).** When this skill spawns `Agent` / `Explore` / `general-purpose` / `Plan` sub-agents, write the prompt text in caveman **full** mode — fragments, drop articles, drop filler, drop pleasantries, drop hedging, imperatives only. Preserve exactly: file paths, code blocks, error messages, identifiers, URLs. Cuts roughly 60-75% of inter-agent tokens with no loss of technical content. Skeleton and before/after example live in `references/caveman-prompt-template.md`. Auto-clarity exception: irreversible-action sequences stay in plain English.
- **User-facing artifact copy.** If the official `caveman` skill is installed globally, write the HTML artifact body in caveman **lite** — plain English, full sentences, no filler, no marketing voice. Agent-handoff sections and "copy prompt" buttons inside the artifact use caveman **full**. If `caveman` is not installed, mimic the same brevity rules; do not require installation to finish the artifact.

## Final Response

Return the artifact path, what sources were used, any skipped external lookup, and the validation commands or checks run.

## References

- `references/artifact-types.md` — per-type recipe sheet covering the nine artifact shapes, plus the long-form Problem / Approach / Alternatives scaffold.
- `references/themes.md` — `editorial`, `utilitarian`, `minimal` theme tokens, layout rules, and selection logic.
- `references/web-triggers.md` — canonical opt-in trigger list. Update this file when adding new triggers, not `SKILL.md`.
- `references/caveman-prompt-template.md` — sub-agent prompt skeleton and before/after sample.
- `../scribble-research/references/artifact-patterns.md` — shared section types, source ledger labels, `Before Emitting` checklist, agent handoff format.
