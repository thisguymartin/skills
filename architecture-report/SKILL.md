---
name: architecture-report
description: "Scan a project, an app in a monorepo, or one feature flow and explain its architecture at the altitudes the asker picks: system context, apps and services, one request or event end to end, code modules, data model, cost, operations, and risk. Always asks what the report is for before scanning, pulls evidence from every connected tool (GitHub, Linear, Notion, Slack, Vantage, Datadog, Sentry, Mixpanel, Vercel, DynamoDB, GraphQL), delegates cost to cloud-investigate, draws the flows in Excalidraw and as inline SVG, publishes an HTML report, and runs the prose through humanizer. Use whenever someone asks how a project or feature works, wants an architecture diagram, a system overview, an onboarding explainer, a 'how does X flow through the system' answer, a cost breakdown of an architecture, or a report for leadership, even if they only say 'explain this' or 'draw this'."
license: MIT
---

# Architecture report

The same questions come back every few weeks in different words: how does this project work, how does this feature flow, what does it cost, what breaks if X goes down. This skill answers them with one report that reads at several altitudes. An exec reads the first screen, an engineer reads the flow, and whoever owns the bill reads the cost section. Each altitude has its own evidence, diagram, and questions; [altitudes.md](altitudes.md) defines them.

The sub-skills do the work and each is optional. When one is missing, do its step directly.

| Step | Skill | Fallback |
|---|---|---|
| Outside evidence | [gather-context](../gather-context/SKILL.md) | call the connected tools yourself, [sources.md](sources.md) |
| Code and domain tracing | [project-research](../project-research/SKILL.md) | read the code, record file:line |
| Cost, queues, logs | [cloud-investigate](../cloud-investigate/SKILL.md) | Vantage tools plus scoped `aws` reads |
| Diagrams | [excalidraw](../excalidraw/SKILL.md) and the feature-plan diagram script | hand-authored inline SVG |
| Page | [plan-artifact](../plan-artifact/SKILL.md) or the host's artifact tool | standalone HTML file |
| Prose | humanizer (embedded mode) | edit against its pattern list by hand |
| Saving | [notion-brain](../notion-brain/SKILL.md), Slack canvas, Linear document | local file only |

## Inputs

A repo path (or several), optionally an app or package inside it, a feature name or ticket, and anything the asker already knows. Record branch and HEAD for every repo before reading. If a path is empty, search for the checkout (`find ~ -maxdepth 5 -type d -name <repo> -not -path '*/node_modules/*'`) before reporting it missing.

## Workflow

### 1. Ask before scanning

Ask once, up front, with the host's question tool. The answers decide which altitudes get built, which tools get called, and how long the scan takes, so a report built without them answers a question nobody asked. Four questions at most:

1. **Scope.** Whole project, one app or package, or one feature flow. For a feature, which entry point (a page, a mutation, a queue, a webhook).
2. **Altitudes.** Multi-select from [altitudes.md](altitudes.md): context, containers, flow, code, data, cost, operations, risk. Recommend a default based on the request: "how does it work" gets context + containers + flow; "explain this feature" gets flow + code + data; "what does it cost" gets containers + cost + operations; "for leadership" gets context + cost + risk.
3. **Audience and decision.** Engineers onboarding, product, leadership, or a specific decision ("should we move X off Lambda"). The decision reshapes the whole report; an onboarding explainer and a cost case share evidence but not structure.
4. **Destination.** Private artifact page only (default), plus the Excalidraw canvas for annotation, plus a saved record in Notion, Slack canvas, or Linear document. Writing anywhere shared needs a yes here.

When the session cannot ask (autonomous run, no question tool), take the defaults, say so at the top of the report, and list the questions the asker would have been asked.

### 2. Inventory the tools

Discover what is connected before reading code, with the host's tool search; the inventory changes from session to session and a tool that failed to connect is a gap to report, not a missing capability. Map each chosen altitude to its sources using [sources.md](sources.md). Each tool has a short "what it tells you about architecture" entry there: Vantage for cost per service, Datadog and Sentry for error and latency shape, Mixpanel for real traffic volume, Vercel for deploy topology, DynamoDB tools for real row shapes, GraphQL tools for the live schema, GitHub for the PR trail, Linear and Notion for the decisions behind the design, Slack for the arguments that never reached a document.

Obey each tool's own prerequisites (Mixpanel wants its business context first; Vantage wants a workspace). Read-only throughout: no reports created, no tags, no budgets, no issues, no messages, unless step 1 authorized a specific write.

### 3. Scan the repo

Run the scanner first; it gives a deterministic inventory to read against so the trace in step 4 starts from facts rather than a guess about where things live.

```bash
node <skill-dir>/scripts/scan-project.ts --root /path/to/repo --out ./scan.json
node <skill-dir>/scripts/scan-project.ts --root /path/to/repo --app apps/web --out ./scan-web.json
```

It uses `git ls-files` (so ignored and vendored files are skipped) and reports workspaces and their dependency edges, infra and deploy files, CI workflows, schema and migration files, route and handler files, queue and event keywords, environment variable names (names only, never values), external hosts referenced in source, and the biggest files. It writes JSON plus a Markdown summary and never executes project code. Read the summary, then open the files it points at; the scanner only says where things are, the trace in step 4 says what they do.

### 4. Trace at each altitude

Follow [altitudes.md](altitudes.md) for the chosen levels. The order matters: context before containers before flow, because each level's nodes become the next level's boundaries, and data before cost, because unit cost needs a denominator. For each level record what was observed (file:line at a commit, a tool result with its retrieval time), what was inferred, and what is unknown. Every claim that will appear in the report gets a source id (S1, S2, …) as it is found.

Cost goes through cloud-investigate: confirm workspace and account, use actual rather than forecast unless asked, align dates, and attach the Vantage report or query link. Tie every cost line to a container or flow node so the reader sees what the architecture is paying for. Never state a saving without a utilization figure behind it.

Model the domain before the folders at the flow and data levels: actors, entities, lifecycle, who owns which id, what crosses a service or tenant boundary. Most "why is it built this way" questions answer themselves there.

### 5. Draw

One diagram per altitude, each making one claim, six nodes or fewer; split rather than crowd. Nodes and edges carry a state: `current`, `built` (on a branch), `new` (proposed), `fail`, `rule`. Label every arrow with what moves or what triggers it. Cost diagrams put the monthly figure on the node and the unit cost on the edge.

With the feature-plan script installed, write one spec and render the page SVG, the `.excalidraw` scenes, and the canvas push from the same coordinates ([diagram-format.md](../feature-plan/diagram-format.md)):

```bash
node <feature-plan-dir>/scripts/diagrams.ts --spec diagrams.json --out ./diagrams
```

Without it, draw on the canvas with the Excalidraw tools and hand-author the page SVG following the artifact-diagramming rules: `viewBox` sized to the content, `currentColor` for strokes and text, one literal hue for the element under discussion, markers for arrowheads, a `<figcaption>` stating the claim, no scripts or foreign objects. Fix every fit warning or clipped label before moving on; `get_canvas_screenshot` is the check.

If the asker chose the canvas in step 1, hand it off (`excalidraw-inbox --handoff`) and watch for Send to Claude clicks after delivery; annotations come back as changes to the report.

### 6. Build the page

Follow [report-template.md](report-template.md). The first screen answers the question in plain language with the one diagram that matters most, then the altitudes follow in order, each with its diagram, its text equivalent, its evidence ids, and its open questions. The source ledger closes the page. Examples are synthetic; every id, email, hash, and dollar figure in an example is made up, while figures from Vantage or Datadog are real and dated.

Render with the host's artifact tool when there is one (private by default, apply artifact-design before writing). Otherwise plan-artifact's renderer or a standalone HTML file with inline CSS and SVG. Check once at desktop and phone width for overflow, clipped labels, and overlapping text; one pass of fixes.

### 7. Humanize and deliver

Run every prose section through humanizer in embedded mode before publishing. The tells that survive most often in reports like this: not-X-but-Y framing of tradeoffs, a one-line closer after each section, bold labels on every bullet, and inflated words around ordinary findings. Keep the numbers, ids, and file paths untouched.

The reply leads with the link, the one-paragraph answer, then one line per altitude with its main finding and confidence, then what was not checked and exactly which tools and commands ran. Offer, without doing: a save to Notion, a Slack canvas, a Linear document, a short message for the team. Each of those is its own authorization unless step 1 already gave it.

## Granularity rules

The decision sets the depth. A leadership report stops at containers and cost with a flow diagram only for the one path under discussion. An onboarding report goes to code level for the two or three modules a new engineer touches first and stays at containers for the rest. A feature report traces one path to code level and leaves the rest of the system as context. When the asker wants everything, build the levels in order and say at each one what was left out and why.

## Privacy

Environment variable names are evidence. Values never go in. No customer payloads, raw logs, message bodies, or credentials in the page or the canvas. Quote Slack by channel and date, never by person; leave direct messages out. Cost figures are internal; the page stays private unless the asker shares it. Nothing from the repo or the tools goes to an external renderer or AI service.

## Stopping condition

Done when each chosen altitude has a diagram, a text equivalent, sourced claims with confidence, and its open questions; the first screen answers the asker's question on its own; cost lines map to nodes; the prose passed humanizer; and the reply names every tool that was unavailable or unqueried. When a source was unreachable, the report names the gap instead of filling the section from guesswork.
