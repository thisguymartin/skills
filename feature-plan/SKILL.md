---
name: feature-plan
description: "Turn a ticket plus a rough feature idea and its open questions into a researched visual plan that answers each question with a recommendation and confidence. Chains gather-context, project-research, Excalidraw diagrams and plan-artifact across one or more repos. Use when someone shares a Linear/GitHub issue and asks things like 'should we store X per Y, S3 or Dynamo, can users edit it later, one or many' and wants a plan with diagrams."
license: MIT
---

# Feature plan

The asker arrives with a ticket, an idea, and questions they have half answered: "store the JSON per property? S3 or Dynamo? edit later? multiple plans, leaning no but guessing yes." The job is to answer each of those questions from evidence (the code, the ticket trail, branches that already exist, earlier decisions), draw today versus the proposal, and hand back a sequenced plan.

This skill sets the order of operations. The sub-skills do the work: [gather-context](../gather-context/SKILL.md) for sources, [project-research](../project-research/SKILL.md) for code and domain, [plan-artifact](../plan-artifact/SKILL.md) for the page, [excalidraw](../excalidraw/SKILL.md) for the canvas. Each works without the others; when one is not installed, do its step directly.

## Inputs

A ticket link or id, the repos involved (paths can be wrong), the asker's questions and leanings, and the audience if stated. Default audience: the asker's team, engineers and product.

## Workflow

1. **Write the question list.** Pull every explicit question and every leaning out of the request. Each one gets exactly one answer in the final recommendation, with a confidence and evidence ids. A leaning is a hypothesis to test.
2. **Read the ticket trail** (gather-context). Fetch the issue, its comments, attachments and relations, then the parent, children, and recently updated, canceled or duplicate issues in the same project. Open every attached branch, PR and artifact. Search chat for the ticket id and the topic, and read whole threads, not search snippets. Give every source an id (S1, S2, …) as you read it.
3. **Find what already exists before designing anything.** For each branch named in the ticket or in threads: `git fetch origin <branch>`, `git log --oneline origin/main..origin/<branch>`, `git diff --stat origin/main...origin/<branch>`, then `git show origin/<branch>:<path>` for the key files. Read earlier artifacts and memos on the topic. Often part of the feature is built or a question was already decided; the plan then covers the gap.
4. **Read the current code in every repo** (project-research). If a given path is empty or not a git repo, search for the checkout (`find ~ -maxdepth 5 -type d -name <repo> -not -path '*/node_modules/*'`) before reporting it missing. Record branch and HEAD for each repo. Trace where state lives today (storage keys, tables, buckets), how ids are minted (this usually settles "one or many"), what crosses a service boundary, and the failure paths. Note exact files.
5. **Model the domain.** Entities, which ones change and which are frozen, keys, owners, cardinality, invariants. Most "where should this live" questions resolve here, for example a mutable working copy versus an immutable snapshot taken at a business event.
6. **Decide.** For each question: recommendation, confidence, and the reason. An options table that includes "ship what is already built", "no change", and each credible alternative with its cost and risk. For each leaning, a small tradeoff table. Plan steps that each have an outcome, a dependency and a done-when check, plus the deploy order between repos. Open questions phrased so a named team can answer them.
7. **Draw** (excalidraw). Write one spec file and run the script; it renders the page SVG, the `.excalidraw` files and pushes to the live canvas when one is running. Format and page snippets: [diagram-format.md](diagram-format.md).
   ```bash
   node <skill-dir>/scripts/diagrams.ts --spec diagrams.json --out ./diagrams
   ```
   Usual set: today on main, built on a branch (if any), the domain, each proposed flow. Every node and edge carries a state: `current`, `built`, `new`, `fail`, or `rule`. Keep six or fewer nodes per diagram and split rather than crowd. Fix every fit warning the script prints.
8. **Build the page** (plan-artifact). Section order:
   1. Recommendation: one bullet per question from step 1, each with a confidence.
   2. Scope: repos with SHAs, sources read, sources not checked.
   3. Where each thing lives: thing, store, why there, state.
   4. Today, then built but not merged, then the domain, each with its diagram.
   5. Proposed flows, with one synthetic example carried through all of them.
   6. Options, the tradeoff tables for each leaning, the plan, open questions.
   7. Source ledger.

   Cite source ids next to claims. Every id, email, hash and order number in examples is made up.
9. **Check once.** Render with headless Chrome at desktop and phone width and look for horizontal overflow, clipped text and overlapping labels. One pass of fixes, no loop.
   ```bash
   chrome --headless=new --hide-scrollbars --virtual-time-budget=4000 --window-size=1280,7600 --screenshot=desk.png file://$PWD/page.html
   chrome --headless=new --hide-scrollbars --virtual-time-budget=4000 --window-size=400,2400 --screenshot=phone.png file://$PWD/page.html
   ```
   On macOS `chrome` is `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`. A page meant for an artifact host has no `<html>`/`<body>`; wrap it in a minimal document for the screenshot.
10. **Deliver.** When the host has an artifact tool, publish privately and tell the asker who still needs access; otherwise hand over the local HTML. The reply leads with the link, the main finding, and the answer to each question with its confidence, then gaps and exactly what was run. Offer, without doing: a short team message that opens the discussion (run it through humanizer), a link on the ticket, new sub-issues. Writing to the ticket tracker or chat needs the asker's go-ahead.

## Excalidraw canvas

Use a new output directory for each revision; the script refuses existing directories to preserve edited scenes. It looks for a canvas at `--canvas <url>`, then `EXPRESS_SERVER_URL`, then `excalidraw-inbox --url`, then `http://127.0.0.1:3000`, and checks `GET /health` for `service: mcp-excalidraw-canvas`. When it is up, each push appends a new revision with fresh IDs below existing content; earlier drawings and annotations stay intact. `--replace` requires the asker's agreement and saves a recovery snapshot before replacing the canvas. When it is down, the page SVG and `.excalidraw` files are still written and the script prints how to start a canvas. A missing canvas never blocks the plan.

After pushing, the excalidraw skill's handoff and Send to Claude loop works on the same canvas if its launcher is installed. Without it, export a PNG for a visual check:

```bash
curl -s -X POST <canvas>/api/export/image -H 'content-type: application/json' -d '{"format":"png","background":true}'
```

## Privacy

The shared page holds synthetic examples only. Quote chat from public channels by channel and date, never by person, and leave direct messages out. No customer payloads, credentials or raw logs. Search snippets are leads, not evidence.

## Stopping condition

Done when each question from step 1 has an answer with a confidence and evidence ids, the diagrams show current, built and proposed states distinctly, every plan step has a done-when check, and the reply says what was not checked. If a source was unreachable, deliver the plan with that gap named.
