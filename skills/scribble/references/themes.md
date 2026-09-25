# Themes

Three theme presets for HTML artifacts. The skill picks a default from artifact type + audience; the user can override.

Load only the row matching the chosen theme. Themes are inline CSS only — no CDN, no font upload, no build step.

## Selection Rules

| Condition | Theme |
| --- | --- |
| Type ∈ {`report`, `research`, `plan`, `walkthrough`} AND audience mentions leadership / exec / CTO / CEO / board / investor | `editorial` |
| User says "make it pretty", "make it editorial", "serif", "press style", or passes `--theme editorial` | `editorial` |
| User says "keep it plain", "utilitarian", "compact", or passes `--theme utilitarian` | `utilitarian` |
| User says "monochrome", "archival", "no color", or passes `--theme minimal` | `minimal` |
| Type ∈ {`compare`, `tool`, `design`, `diagram`, `deck`} with no override | `utilitarian` |
| Anything else | `utilitarian` |

Confirm the picked theme in the same one-line confirmation as the type pick.

## editorial

Reference shape: long-form executive report styled like a print magazine feature. Cream paper, serif display headlines, italic accent word, oversized stat figure, "Exhibit A / Exhibit B" section labels, captioned charts, methodology footer in monospace.

**Tokens (inline as `:root` CSS variables):**

```
--paper: #F2EDE4;
--ink: #1A1815;
--muted: #6B6258;
--rule: #D9D2C5;
--accent: #E85A2C;
--exhibit-bg: #1B1A18;
--exhibit-ink: #E6E1D6;
--exhibit-line: #4DA3E0;
--positive: #2F6A4A;
--display-serif: "GT Super Display", "Tiempos Headline", "Canela", "Playfair Display", Georgia, serif;
--body-serif: "Tiempos Text", "Source Serif Pro", "Lora", Georgia, serif;
--mono: "Berkeley Mono", "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
```

**Layout:**

- `body { background: var(--paper); color: var(--ink); font-family: var(--body-serif); }`
- Centered reading column, `max-width: 640px`, padding `clamp(24px, 6vw, 80px) 24px`.
- Vertical rhythm: section gaps `clamp(48px, 8vh, 96px)`. Generous, not cramped.
- Top eyebrow line: small-caps monospace, letter-spacing `0.12em`, separated by `·`. Pattern: `MIGRATION REPORT · BIGGIE · 2026-05-18 · 1,184 PR RUNS ANALYZED`. Includes a 6px accent dot before the first label.

**Display headline (h1):**

- `font-family: var(--display-serif); font-weight: 500; font-size: clamp(40px, 6.5vw, 72px); line-height: 1.02; letter-spacing: -0.01em;`
- Two-line phrasing: setup line, then payoff line ending in an italic word in `var(--accent)`. Example: `The build got fast. The deploy got <em>faster.</em>`
- Italic accent word uses the display serif's italic, not synthetic italic.

**Stat figure block:**

- Wrapper `<figure class="stat">` with the number, a `<figcaption>` label in monospace small-caps, and a short prose paragraph.
- Number: `font-family: var(--display-serif); font-size: clamp(120px, 18vw, 240px); font-weight: 400; line-height: 1;`
- The `%` (or unit) glyph is italic and colored `var(--accent)`.
- Caption label sits to the right of the number, top-aligned: monospace, uppercase, `letter-spacing: 0.14em`, color `var(--muted)`.

**Exhibit sections:**

- Each major exhibit gets `<section class="exhibit">` with `<h2>Exhibit A: <topic></h2>` and a right-aligned monospace eyebrow (`VERCEL · PRODUCTION`).
- `h2` uses display serif, weight 500, `font-size: clamp(28px, 3.2vw, 40px)`.
- Eyebrow: monospace uppercase, `letter-spacing: 0.14em`, `color: var(--muted)`, floated right on wide screens, stacked below on narrow.

**Charts and screenshots:**

- Embedded screenshots framed in `var(--exhibit-bg)` with `border-radius: 8px`, padding `24px`.
- Captions below in monospace, color `var(--muted)`, with inline code-like spans around identifiers wrapped in a thin accent-tinted background: `background: rgba(232,90,44,0.08); color: var(--accent); padding: 0 4px; border-radius: 3px; font-family: var(--mono);`.
- Inline SVG line charts: line in `var(--exhibit-line)`, axes in `var(--muted)` at 40% opacity, no gridlines, single dot annotation at the latest value with monospace label.

**Horizontal stacked bar comparison (Exhibit B pattern):**

- Each row is a `<div class="row">` with: left label block (name + migration date in monospace), middle bar pair (before bar in `--rule`, after bar in `--positive`, both with inline duration labels), right score in display serif italic with superscript `+`.
- Bars are 6px tall, full-width container, before bar above after bar with `4px` gap.
- Score formatted as `<span class="score">75<sup>+</sup></span>`, font-size `clamp(28px, 2.4vw, 36px)`, font-style italic, color `var(--ink)`.

**Problem breakdown / Approach / Alternatives blocks:**

- Section headings use the same display serif h2 treatment.
- Body uses the body serif at `18px / 1.55` line-height.
- Alternatives render as a small `<dl>`: `<dt>` is the alternative name in italic, `<dd>` is the one-line "why not" in muted color.

**Methodology footer:**

- Pulled into its own `<footer>` with display-serif `How we measured` heading, then dense body serif paragraphs at `15px`.
- Bottom rule: 1px `var(--rule)`, then monospace meta row pattern: `Source · <thing> | Dates · <range> | Generated · <host>`.
- Inline identifiers wrapped in the same accent-tinted code span as captions.

**Don'ts:**

- No drop shadows, no gradients, no rounded big cards. The look is print, not SaaS dashboard.
- No emoji. No decorative icons. Accent color used sparingly — one italic word per headline, one tinted code span per paragraph max.
- No more than 2 type sizes per section.

## utilitarian

Default look for compact / interactive / comparison artifacts. Optimizes for scan density and decision speed.

**Tokens:**

```
--bg: #FAFAF9;
--surface: #FFFFFF;
--ink: #111111;
--muted: #6B7280;
--rule: #E5E7EB;
--accent: #2563EB;
--positive: #15803D;
--warn: #B45309;
--danger: #B91C1C;
--sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
--mono: ui-monospace, "JetBrains Mono", "SF Mono", monospace;
```

**Layout:**

- `body { background: var(--bg); color: var(--ink); font-family: var(--sans); font-size: 15px; line-height: 1.5; }`
- Full-bleed container with `max-width: 1100px`, padding `24px`.
- Section gaps `32px`. Tables, cards, and grids dominate over prose.
- Headings: same sans, weight 600. `h1` 24px, `h2` 18px, `h3` 15px uppercase tracked.

**Cards / tables:**

- Cards: `background: var(--surface); border: 1px solid var(--rule); border-radius: 6px; padding: 16px;`.
- Tables: zebra rows with `var(--bg)`, sticky header on long lists.
- Severity pills: rounded `999px`, padding `2px 8px`, monospace, colored by `--positive` / `--warn` / `--danger`.

**Charts:** inline SVG, single accent color, no decoration. Axes in `var(--muted)` 40% opacity.

**Use cases:** `compare`, `tool`, `design`, `diagram`, `deck`, and any artifact where the reader needs to scan / pick / interact rather than read.

## minimal

For archival, legal, audit-trail, or printable artifacts. No accent color, no decorative elements.

**Tokens:**

```
--bg: #FFFFFF;
--ink: #000000;
--muted: #555555;
--rule: #CCCCCC;
--serif: Georgia, "Times New Roman", serif;
--mono: ui-monospace, monospace;
```

**Layout:**

- Single column, `max-width: 720px`, `font-family: var(--serif); font-size: 16px; line-height: 1.6;`.
- Headings same serif, weight bold, no tracking changes.
- Rules: `1px solid var(--rule)` only.
- No color. No shadows. Print-friendly — passes `@media print` without modification.

**Use cases:** legal review docs, compliance reports, anything the reader may print or archive.

## Notes For Implementation

- Always inline the chosen theme's `:root` block at the top of the `<style>` tag. Do not link external stylesheets.
- The font stacks include broad fallbacks intentionally — `editorial` looks fine in Georgia if no Tiempos is installed.
- Charts/diagrams in editorial mode use the same palette tokens — never introduce new colors mid-artifact.
- When a `design-system.html` is present in `./html-artifacts/`, prefer its tokens over these defaults, then apply the layout patterns from this file on top.
