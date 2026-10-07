# Altitudes

Each altitude answers a different question, reads different evidence, and gets its own diagram. Build only the levels the asker picked in step 1, in this order, because each level's boxes become the next level's boundaries.

| Level | Question it answers | Typical reader |
|---|---|---|
| Context | What is this, who uses it, what does it talk to outside itself | Leadership, new hires, partners |
| Containers | Which apps, services, stores, and queues exist and how they are deployed | Engineers, platform, leadership |
| Flow | How does one request, event, or job travel from entry point to visible outcome | Engineers, product |
| Code | Which modules and functions carry that flow, with file:line | Engineers changing it |
| Data | Which entities exist, who owns their ids, where they live, what crosses a boundary | Engineers, data, product |
| Cost | What the architecture costs per month and per unit, and where it moves | Leadership, finance, platform |
| Operations | How it is deployed, observed, flagged, and recovered | Platform, on-call |
| Risk | What breaks if a component goes down, where a single point of failure or an auth boundary sits | Leadership, security, platform |

## Context

**Evidence.** README and app-level docs; the scanner's external hosts list; Auth provider and analytics config; Linear projects and Notion pages that name the system's purpose; Slack threads about who the users are. Mixpanel gives actor volume (how many of which kind of user per week) when connected.

**Diagram.** The system as one box, the actors around it, the external services it depends on. Six nodes or fewer. Arrows labeled with what crosses: `login`, `orders`, `events`, `cost data`.

**Questions to leave.** Who owns the system, which actors matter most, which external dependency is hardest to replace.

## Containers

**Evidence.** Workspace graph from the scanner (apps, packages, their dependency edges); infra and deploy files (`vercel.json`, `wrangler.toml`, `fly.toml`, `serverless.yml`, CDK, Terraform, Dockerfiles); CI workflows; GraphQL endpoints and schema; queue and event keywords; Vercel project list when connected; `aws sts get-caller-identity` plus resource reads via cloud-investigate when AWS is in play.

**Diagram.** One box per deployable, one per store, one per queue, one per external API. Zones mark a deploy target or an account. Edges carry protocol or payload: `GraphQL`, `SQS`, `webhook`, `cron`. Mark `built` for anything on an unmerged branch.

**Questions to leave.** Which containers share a database, which have no owner, which are deployed by hand.

## Flow

**Evidence.** The entry point the asker named (route file, resolver, handler, consumer); the code path from there through state changes, integrations, and events to the visible outcome; tests that fix the behavior; Datadog or Sentry for where it fails in practice; Mixpanel for how often it runs. Trace failure, retry, cancellation, permissions, and tenant boundaries, and say where observed execution stops.

**Diagram.** Left to right from trigger to outcome. One `fail` branch per real failure path. Where a step is inferred rather than read, the node says so and the state stays `current` with an evidence id marked inference.

**Questions to leave.** What happens on partial failure, who gets paged, whether the flow is idempotent.

## Code

**Evidence.** The files the flow trace touched; exports and call graph for those modules; the tests; recent commits and PRs that changed them (GitHub); the Linear issue that introduced them. Record exact file:line at the recorded HEAD.

**Diagram.** Modules as boxes, calls as arrows, only for the modules a changing engineer needs. More than six boxes means the level is too wide; split by flow step.

**Questions to leave.** Where the next change should go, which module is the one nobody wants to touch.

## Data

**Evidence.** Schema files, migrations, GraphQL types, ElectroDB or ORM entities, storage keys; real row shapes from the DynamoDB tools or a bounded SQL read when connected (aggregate or redacted only); the code that mints ids. Model aggregates, entities, value objects, and events before describing tables.

**Diagram.** Entities with their keys and owners, zones for each store, edges labeled with the relation or the event that moves data between stores. A `rule` edge marks an invariant ("snapshot never rewrites").

**Questions to leave.** Which entity has two sources of truth, which id is minted in two places, which store holds data nobody reads.

## Cost

Delegate to cloud-investigate. Confirm the Vantage workspace, provider accounts, and date window first; prefer actual over forecast; align periods for any comparison; note billing lag and data freshness.

**Evidence.** Vantage cost reports grouped by service and by account; existing reports before new queries; resource-level reports for the top services; Vercel and third-party SaaS line items where available; usage denominators (requests, events, orders, active users) from Mixpanel or Datadog for unit cost.

**Diagram.** The containers diagram with a monthly figure on each priced node and a unit cost on the main edge. One hue for the node under discussion. A `new` node for any proposed change with its estimated figure labeled as an estimate and its basis in the caption.

**Table.** Service, monthly actual, share of total, trend over the window, the container it maps to, the evidence id. Totals reconcile to the report linked in the ledger.

**Questions to leave.** Which line has no owner, what the growth driver is, what the next tier threshold costs. Savings claims need a utilization figure; without one they stay as questions.

## Operations

**Evidence.** CI workflows and deploy configs; Vercel deployments; feature flag provider config; Datadog monitors and dashboards; Sentry projects and alert rules; runbooks in Notion; on-call notes in Slack; log groups and queues via cloud-investigate.

**Diagram.** Deploy path from merge to production, with the observability taps as side nodes: where logs go, where errors go, where metrics go, who gets alerted.

**Questions to leave.** Which service has no monitor, which deploy has no rollback, which flag is permanent.

## Risk

**Evidence.** The containers and flow diagrams read for single points of failure; auth boundaries (Auth0 middleware, Oso, machine tokens); public routes and webhooks; third-party dependencies with no fallback; the security-scan skill when the asker wants findings rather than a map.

**Diagram.** The containers diagram with the fragile edges in the warning hue and a note per risk saying what fails and who notices. Do not invent a risk the evidence does not show; an unknown is reported as unknown.

**Questions to leave.** Who decides the acceptable blast radius, which risk has a ticket already.
