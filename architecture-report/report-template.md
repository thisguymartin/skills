# Report template

Section order for the page. Drop a section whose altitude was not chosen; never leave an empty heading. Every figure has a caption stating its claim and a text equivalent under a details toggle. Evidence ids sit beside the claim they support.

```markdown
# <System or feature>: architecture report

**Answer.** Two to four sentences that answer the asker's question without the rest of the page.
**Prepared for.** Audience and the decision, if any. **As of.** Date, repo(s) with branch and HEAD.
**Defaults taken.** Only when step 1 could not be asked: the assumed scope, altitudes, audience.

[The one diagram that carries the answer]

## At a glance
One line per chosen altitude: main finding, confidence, evidence ids.

## Scope and coverage
Repos and SHAs. Tools read. Tools connected but not read, and why. Tools that failed to connect.

## Context
Prose, diagram, text equivalent, open questions.

## Containers
Prose, diagram, table (container, deploy target, owner, store, evidence), open questions.

## Flow: <entry point> to <outcome>
One synthetic example carried through. Prose, diagram, failure branches, where observed execution stops, open questions.

## Code
Module table (module, file:line, role in the flow, last meaningful change with PR), diagram, open questions.

## Data
Domain model (aggregates, entities, ids, owners, invariants), store table, diagram, open questions.

## Cost
Window, workspace, actual vs forecast. Diagram with figures. Table (service, monthly, share, trend, container, evidence). Unit cost with its denominator. Proposed changes as estimates with basis. Open questions.

## Operations
Deploy path, observability taps, flags, recovery. Diagram. Table of monitors and alerts. Open questions.

## Risk
Single points of failure, auth boundaries, dependencies without fallback. Diagram. Each risk: what fails, who notices, evidence, existing ticket if any.

## Open questions
All of the above collected, each phrased so a named team can answer it.

## Sources
Ledger: id, tool, locator, source date, retrieved, scope, limits.
```

## Page mechanics

- Artifact tool host: load artifact-design, then publish privately. No `<html>` wrapper if the host adds one; wrap it for the headless screenshot.
- plan-artifact renderer: map sections to its JSON; flows of more than eight nodes go to a custom SVG.
- Standalone: HTML5, inline CSS and SVG, Google Fonts only, works offline, prints.
- Diagram CSS and figure markup: [feature-plan/diagram-format.md](../feature-plan/diagram-format.md) when the script was used; artifact-diagramming rules otherwise.
- Phone width: `grid-template-columns: minmax(0, 1fr)` on sections so a wide SVG scrolls inside its figure rather than the page.

## Reply shape

Link first. Then the answer paragraph. Then one line per altitude. Then gaps and the exact tools and commands run. Then offers (Notion, Slack canvas, Linear document, team message) without doing them.
