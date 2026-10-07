# Sources

What each connected tool tells you about an architecture, and which altitude it feeds. Discover the live inventory with the host's tool search before relying on any row; a tool that failed to connect is reported as a gap. Everything here is read-only. Record a retrieval time and a locator for each read.

| Tool | What it adds | Altitudes | Before using |
|---|---|---|---|
| Repo and `git` | Current code, HEAD, recent history, branches with unmerged work | all | `git rev-parse HEAD`, `git status` for dirty files |
| Scanner (`scripts/scan-project.ts`) | Workspaces, deps, infra, routes, schemas, env names, external hosts | context, containers, data, operations | run once per repo or app |
| GitHub | PR trail for a module, who changed it and why, open PRs touching the flow, releases | code, operations | `get_me` first; `gather-context`'s `github-evidence.ts` for a PR or issue bundle |
| Linear | The issue or project that introduced the design, open follow-ups, documents | context, flow, risk | fetch the issue and its comments, then parent and related issues |
| Notion | Decision records, runbooks, prior briefs; Martin's Brain via notion-brain recall | context, operations | search inside the known database first; a snippet is a lead, not evidence |
| Slack | The thread where the design was argued, incident threads, on-call notes | flow, operations, risk | read whole threads; quote by channel and date, never by person |
| Vantage | Cost by provider, account, service, resource; forecasts; unit costs when a business metric exists; recommendations with utilization | cost | `get-myself`, confirm workspace, list existing reports before querying; follow cloud-investigate's Vantage mode |
| AWS CLI | Queue attributes and tags, log groups, bounded log pages, identity | containers, flow, operations | `aws sts get-caller-identity` and compare the account; explicit `--profile --region --no-cli-pager`; never `receive-message` during research |
| Datadog | Monitors, dashboards, error and latency shape per service, log volume | flow, operations, cost (log volume) | authenticate; pick the service and window before querying |
| Sentry | Where a flow actually fails, how often, since when | flow, operations, risk | authenticate; scope to the project |
| Mixpanel | How often each flow runs, by actor type; denominators for unit cost | context, flow, cost | `Get-Business-Context` first; aggregate counts only |
| DynamoDB (dynomatic-query, field-prod-data) | Real row shapes, entity discriminators, counts, write dates | data | bounded reads; aggregate or redacted facts only in the report |
| GraphQL (yaak-query) | Live schema, operation shapes, response examples | containers, data, flow | introspect or run a saved request; synthetic variables |
| session-history | What was decided about this system in earlier sessions | context, risk | search by repo and topic |
| Current docs (Context7, web) | Framework and provider behavior behind a claim, pricing tiers for a cost projection | code, cost, operations | date every pricing figure |

## Mapping an altitude to its reads

Pick the two or three sources that can change the answer, read those fully, and stop. Deepen only when a claim in the draft has no evidence id. A report that touched every tool once and none properly reads worse than one with three sources and a named gap.

Context: repo docs, Linear project, Mixpanel actor counts.
Containers: scanner, infra files, Vercel, AWS identity and resources.
Flow: code trace, Sentry, Datadog, Mixpanel frequency, the Slack thread that explains an odd branch.
Code: code trace, GitHub PR trail, Linear issue.
Data: schema files, DynamoDB or SQL bounded reads, GraphQL schema.
Cost: Vantage first, then Vercel and SaaS line items, then denominators from Mixpanel or Datadog.
Operations: CI, Vercel, Datadog monitors, Sentry alerts, Notion runbooks.
Risk: the two diagrams above, auth config, security-scan when findings are wanted.

## Recording a read

Each source entry: id, tool, exact locator (URL, file:line at commit, query with its parameters, report id), source date, retrieval date, scope read, and limits (first page only, sampled, denied, empty). Keep raw tool output local; the page carries the finding and the locator.
