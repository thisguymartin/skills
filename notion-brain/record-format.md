# One useful record

Compose a page someone can resume from. The property Summary carries the short answer; the body carries evidence and reasoning. Use the live template's relevant headings, omit empty sections, and keep the page title only in Name. Do not pad a short note with a research report.

## Research or plan

- **Research question**: what Martin is trying to understand or decide.
- **Context**: motivation, workstream, existing constraints, and what is assumed. For cloud evidence, include confirmed provider/account alias/region/workspace, UTC window, currency, cost basis, and billing freshness where applicable. Exclude credentials and customer identifiers.
- **Findings**: each material claim -> supporting original source -> observation/source date -> date checked. Mark confirmed findings, inference with confidence/reason, historical decisions, and hypotheses separately. Preserve pagination, sampling, access, and unknown-block limits.
- **Options and tradeoffs**: relevant alternatives, cost assumptions, constraints, and risks. For technology evaluations, retain the source bundle's maintenance, license, adoption, stack fit, pricing, and breaking-change evidence. Do not fabricate missing evaluation data.
- **Experiments and results**: what was actually tried and observed. Proposed tests stay in the plan.
- **Takeaway / Decision**: what the evidence supports, confidence and why; identify a decision as accepted only when Martin or an authoritative source accepted it.
- **Proposed plan**: ordered actions with dependencies and observable completion checks. Preserve unknown owners/dates. A researched plan is not implemented behavior.
- **Open questions**: unresolved evidence gaps and what would resolve them.
- **Artifact**: stable link or actual Notion attachment, what it explains, editable source when requested, and rendering/access limits. State whether its contents were inspected. Never label a local path as a published artifact.
- **Sources**: canonical URLs or exact repo revision and path:line; source dates, retrieval dates, scope, and limitations. Put evidence beside claims as well as in this ledger. Link related Notion entries using the connector's native mention syntax; a mention does not move a page.
- **Next step**: concrete follow-up, consistent with the property.
- **Dated updates**: new findings and superseded conclusions during an update, keeping earlier observation dates. Include a plain-text Capture ID for locating this operation after an ambiguous response; it is operational metadata, not evidence.

For a short Note or Idea, use context, the useful thought, sources, and next step. For a Decision, lead with the accepted choice and rationale, then alternatives and revisit conditions. For a Project or Task, lead with outcome and scope, then plan, dependencies, checks, and linked evidence. Never manufacture separate records for these sections.

## Recall bundle

Return a compact Markdown answer, or a file in the task workspace when chaining:

```markdown
# Context for the current question
Scope: topic, destination, time window, and number of records actually read.

## Decisions and constraints
Accepted choices with rationale, original date, and source entry URL.

## Findings
Confirmed/historical observations with original sources and freshness limits.

## Ideas and open questions
Proposals, conflicting evidence, and unresolved verification.

## Reusable inputs
Relevant entry/artifact links and facts needed by the next planning step.

## Coverage
Search scope, pages/attachments actually fetched, pagination and access gaps.
```

Scale this to the question. A concise answer can carry these distinctions in a few paragraphs; headings are not mandatory.
