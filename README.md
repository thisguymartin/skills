# thisguyskills

My research and PR toolkit for coding agents. Understand a project, pull context from the tools I use, explain it with diagrams, turn it into an HTML plan, save useful work in Martin's Brain in Notion, and prepare readable PRs when requested.

```text
Repo + GitHub + Linear + Notion + Drive + Slack + cloud evidence
  -> gather-context -> project-research -> plan-artifact
Ticket + open questions + repos -> feature-plan -> answered plan with Excalidraw diagrams
Sentence + paragraph + Linear issue -> idea-to-pr -> questions + detailed brief -> implement + verify -> security-scan -> pr-automation + humanizer -> PR
Research + plan + artifact -> notion-brain save -> one Martin's Brain record
Martin's Brain -> notion-brain recall -> context for the next plan
Past Claude/Codex discussions -> session-history -> relevant decisions
Saved API requests -> yaak-query -> endpoint evidence
A diff or service -> security-scan -> confirmed findings + fixes
DynamoDB tables -> dynomatic-query -> bounded data evidence
A diagram I want to annotate -> excalidraw
Code change -> pr-automation -> create or update one readable PR
```

Most skills work on their own; idea-to-pr uses security-scan, pr-automation, and an installed Humanizer for delivery. The arrows show useful combinations. Existing artifact builders and artifact-upload still work alongside these skills. Research ends at an explanation or plan unless the request includes saving to Notion. Asking idea-to-pr to deliver through a PR covers its scoped implementation and PR workflow; requests for only research, issue drafts, or a plan stop there. Description edits and local previews have narrower scopes.

## Install the skills

Use `skills@latest` to run the Skills CLI. This repo's npm package is also named `skills`, so plain `npx skills` from this checkout can resolve to the local package and fail with `could not determine executable to run`.

From this checkout, including changes that have not been pushed:

```bash
npx skills@latest add . -a claude-code codex --skill idea-to-pr feature-plan project-research gather-context plan-artifact session-history cloud-investigate notion-brain yaak-query dynomatic-query security-scan pr-automation excalidraw
```

Add `-g` for a global install. From GitHub, after these changes are published:

```bash
npx skills@latest add thisguymartin/skills -g -a claude-code codex --skill idea-to-pr feature-plan project-research gather-context plan-artifact session-history cloud-investigate notion-brain yaak-query dynomatic-query security-scan pr-automation excalidraw
```

| Skill | Individual install selector |
|---|---|
| [excalidraw](#excalidraw) | `--skill excalidraw` |
| [project-research](#project-research) | `--skill project-research` |
| [gather-context](#gather-context) | `--skill gather-context` |
| [plan-artifact](#plan-artifact) | `--skill plan-artifact` |
| [feature-plan](#feature-plan) | `--skill feature-plan` |
| [idea-to-pr](#idea-to-pr) | `--skill idea-to-pr` |
| [session-history](#session-history) | `--skill session-history` |
| [cloud-investigate](#cloud-investigate) | `--skill cloud-investigate` |
| [notion-brain](#notion-brain) | `--skill notion-brain` |
| [yaak-query](#yaak-query) | `--skill yaak-query` |
| [dynomatic-query](#dynomatic-query) | `--skill dynomatic-query` |
| [security-scan](#security-scan) | `--skill security-scan` |
| [pr-automation](#pr-automation) | `--skill pr-automation` |

These commands are documented, not run automatically. Installing this collection does not remove previously installed skills with old names; see [compatibility](docs/compatibility.md) for migration.

## What I need installed

Use existing CLI tools first. Cloud investigation runs `aws` directly; saved endpoint queries run `yaak` directly; DynamoDB reads go through the Dynomatic app's MCP server. Optional scripts live inside the skill that uses them. `<skill-dir>` in examples means the installed skill folder (or its folder in this checkout).

| Skill | Required for the task | Optional |
|---|---|---|
| project-research | Repo/files or accessible sources | `git`, `rg`, current-docs/web tools, connected MCPs, existing artifact skill |
| gather-context | Access to the sources being researched | GitHub CLI (`gh`) + Node for its shortcut; Linear/Notion/Drive/Slack MCPs |
| plan-artifact | Node 22.18+ for the bundled renderer, browser to view HTML | Existing HTML/artifact builder; artifact-upload when sharing is requested |
| feature-plan | Node 22.18+ for the diagram script, access to the ticket and repos | gather-context, project-research, plan-artifact, excalidraw canvas, headless Chrome for the visual check, humanizer for the team message |
| idea-to-pr | Target repo(s), security-scan + pr-automation + an installed Humanizer for delivery; `git`, authenticated `gh`, repository checks | Linear tools for issue links; gather-context/project-research for deeper investigation; Excalidraw with mer-inkdrop as the PR diagram backup |
| session-history | Node 22.18+ and local Claude Code or Codex history | No MCP needed; `--root` supports a local export location |
| cloud-investigate | AWS CLI v2 + authenticated profile for AWS reads | Vantage MCP for costs; Datadog/Mixpanel or other connected telemetry |
| notion-brain | Connected Notion read tools; page-write access for saves/updates | Notion attachment tools for requested local artifacts; existing research/artifact outputs |
| yaak-query | Yaak desktop collection + `@yaakapp/cli`; Node/npm to install the CLI | `jq` for local projections/redaction; existing Yaak MCP or official use-yaak skill |
| security-scan | Repo checkout; `git`, `gh` for PR targets | Package audit tool (`pnpm audit`, `govulncheck`, `pip-audit`) for `--audit` |
| dynomatic-query | Dynomatic desktop app running with its MCP server enabled, registered in Claude Code or Codex; authenticated AWS profile inside the app | Sample Mode for testing without AWS; excalidraw/plan-artifact for data-model diagrams |
| pr-automation | `git`, authenticated GitHub CLI (`gh`), repository checks for code delivery | Existing Humanizer skill; Excalidraw skill + drawing/export tools; mer-inkdrop diagram backup; GitHub attachment route |
| excalidraw | Node, local Excalidraw MCP/canvas, `excalidraw-inbox` launcher | Tablet on the local network; setup needs git/pnpm |

No npm dependencies are needed for the three new helpers. If you already use a Node version manager, keep using it. The scripts use native TypeScript support; [Node's docs](https://nodejs.org/en/learn/typescript/run-natively) explain the version requirement.

On macOS with Homebrew, convenient installs are:

```bash
brew install awscli gh node ripgrep
aws --version
node --version
rg --version
gh auth login
gh auth status
```

Install only what you need. AWS's supported installers are in the [AWS CLI v2 installation guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html); Homebrew is a convenience, not AWS's maintained installer. GitHub CLI's [official installation guide](https://cli.github.com/) covers other systems.

For an AWS account using IAM Identity Center:

```bash
aws configure sso --profile research-dev
aws sso login --profile research-dev
aws sts get-caller-identity --profile research-dev
```

Use your existing organization profile if one is already configured. Compare the account returned by the last command with the intended account before resource reads. Do not paste access keys into prompts or files. [AWS SSO setup](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html).

For Linear, Notion, Drive, Slack, Vantage, and other MCPs, connect them through your agent's normal connector setup. The skills discover available tools and can proceed with partial context; they do not install MCPs or change credentials. Plain CLI commands are welcome when they provide the evidence more directly.

For Yaak, install the [desktop app](https://yaak.app/docs/getting-started/installation) if needed, then its official CLI:

```bash
npm install -g @yaakapp/cli
yaak --version
yaak workspace list
```

Optional on macOS: `brew install jq` for local JSON projections. Examples were checked with CLI 2026.8.1; use installed `--help` when versions differ. The CLI automatically uses the app's local collection; no Yaak server or custom wrapper is needed. `yaak auth` is for plugin publishing; endpoint authentication comes from saved requests/environments. [Yaak CLI docs](https://yaak.app/docs/getting-started/cli-usage).

Yaak also ships a general skill through `yaak agent install`. That writes global agent skill directories and refreshes its own use-yaak skill. It is optional and separate from installing this collection; yaak-query adds the research/evidence workflow and does not replace Yaak's managed skill.

## Skills

### [excalidraw](./excalidraw/)

The existing local canvas round trip: draw -> hand over -> read annotations -> update the diagram. Its launcher is preserved. The removed parallel-lanes companion is optional behavior now described in the entrypoint. See [canvas setup](excalidraw/INSTALL.md); the Send to Claude workflow needs the local branch and MCP configuration described there.

> "draw this in excalidraw", "let me annotate it", "check the canvas"

### [project-research](./project-research/)

The main project/feature deep dive. Traces the domain, code and context, explains current behavior, compares proposed changes, and creates a detailed HTML brief with flows, examples, evidence, tradeoffs, and a plan. Keeps technical depth available for engineers while making the main explanation readable for product and leadership.

> "research this project and explain how it works", "research this feature before we build it", "make a detailed visual research brief"

### [gather-context](./gather-context/)

Pulls relevant context from GitHub, Linear, Notion, Drive, Slack, local files, and other available MCPs. Fetches actual sources, reconciles contradictions, and records dates and access gaps. Its GitHub shortcut calls `gh` directly.

> "pull the context from Linear and Slack", "research this across Notion, Drive and GitHub", "collect the evidence for this decision"

```bash
node gather-context/scripts/github-evidence.ts --repo owner/repo --pr 123 --dry-run
```

### [plan-artifact](./plan-artifact/)

Turns evidence and a plan into a standalone HTML explanation. The included renderer produces offline SVG diagrams, source links, expandable detail, alternatives, and steps with completion checks. It complements your existing artifact skill and upload workflow.

> "turn this research into an HTML plan", "make the current and proposed flows visual", "create a readable explanation I can share"

```bash
node plan-artifact/scripts/render-brief.ts --input docs/examples/research-brief.json --output /tmp/research-brief.html
```

Open the [rendered example](docs/examples/research-brief.html) or edit [research-brief.json](docs/examples/research-brief.json). The renderer refuses to overwrite existing files; use a new filename for a revision.

### [feature-plan](./feature-plan/)

The whole chain for one request: a ticket, a rough idea, and the questions you half answered ("store it per property? S3 or Dynamo? edit later? one or many?"). Reads the ticket trail, finds branches and memos that already exist, reads the code in every repo, models the domain, then answers each question with a confidence and draws today, built-on-a-branch and proposed flows. One diagram spec renders the page SVG, `.excalidraw` files, and a push to the live canvas when one is running.

> "here's the Linear issue, should we store this per property?", "research both repos and give me a visual plan", "plan this with excalidraw diagrams"

```bash
node feature-plan/scripts/diagrams.ts --spec feature-plan/examples/saved-carts.json --out /tmp/diagrams --no-canvas
```

### [idea-to-pr](./idea-to-pr/)

One entry point from a rough sentence, paragraph, or Linear issue to a PR. Always asks a meaningful discovery question, follows up in small rounds, and records what the answers change. Traces the frontend, API, backend, saved data, and other consumers where relevant. Builds a detailed brief with domain rules, code evidence, frontend/backend ownership, file-level steps, acceptance cases, and verification. Runs security-scan on each repo's final change before delivery, returns findings to implementation, and rechecks fixes. Uses pr-automation and an installed Humanizer to finish with a concise PR, with Excalidraw for useful flow diagrams; separate repos get scoped, linked PRs.

> "dig into this idea with me, then build it and open a PR", "take this Linear issue through questions to a PR", "figure out the frontend/backend issues we need and keep them scoped"

```text
Use idea-to-pr with JBT-626 and JBT-627 across the frontend and Biggie.
Ask me about the behavior and edge cases. Trace both repos and create a
detailed brief with scoped frontend/backend work, acceptance criteria,
and verification. Then implement and open the PRs.
```

For a narrower destination, say "only draft the scoped issues" or "plan only". Existing templates can be supplied; otherwise use the [adaptable working brief and issue templates](idea-to-pr/templates.md). The [interview guide](idea-to-pr/interview.md) shows how questions build on answers. Humanizer is an existing external skill, not bundled or installed automatically. Creating this skill does not publish a PR or create tracker issues.

### [session-history](./session-history/)

Searches local Claude Code and Codex discussions to recover useful decisions and workflow patterns. Defaults to bounded user prompts; full user/assistant text requires an exact session ID. It does not access claude.ai web history or export entire archives.

> "look at my past Claude discussions", "what did we decide last time?", "find useful workflows from my previous sessions"

```bash
node session-history/scripts/search-history.ts --provider claude --query "research artifact" --limit 10
```

### [cloud-investigate](./cloud-investigate/)

Traces cloud events and cost questions using AWS CLI, Vantage and telemetry tools. The skill instructs the agent to confirm account/region, then run native `aws` commands for SQS metadata or a bounded CloudWatch log window. The log example displays event metadata and pagination tokens; raw message bodies stay local for redaction. Install AWS CLI v2 and authenticate a profile; this skill needs no Node helper.

> "investigate this SQS event path", "fetch the worker logs with AWS CLI", "research this cost increase in Vantage"

```bash
aws sts get-caller-identity --profile research-dev --region us-west-2 --output json --no-cli-pager
```

After checking the returned account, use the [SQS and CloudWatch commands](cloud-investigate/aws-and-costs.md). The example targets are synthetic; replace them with the confirmed resources.

`receive-message` changes visibility/receive counts; message sampling is a separate authorized action. Queue metadata and logs are the normal investigation path. [AWS receive behavior](https://docs.aws.amazon.com/cli/latest/reference/sqs/receive-message.html).

### [yaak-query](./yaak-query/)

Finds saved requests, resolves the intended environment, queries an HTTP/GraphQL endpoint with native Yaak CLI, and explains the response as research evidence. Checks fresh response IDs, HTTP/application errors and pagination; keeps raw payloads local. It can create or adjust saved queries when that is part of the request.

> "use the endpoint I already have in Yaak", "query this API through Yaak", "check the response history", "save this query in my Yaak workspace"

```bash
yaak workspace list
yaak request list wk_synthetic
yaak environment list wk_synthetic
```

Use IDs returned by discovery, then follow the [native query commands](yaak-query/commands.md). A whole workspace send can execute unrelated mutations; discovery lists requests without sending them. No helper script is included.

### [dynomatic-query](./dynomatic-query/)

Answers DynamoDB data questions through the Dynomatic desktop app's MCP server: which tables exist, how a single-table model is keyed, what an item actually contains, why data disagrees with the UI. Classifies prod vs non-prod first, prefers key reads over scans, bounds every page, and redacts item payloads before they leave the machine. Read-only; writes are a separate handoff.

> "what's in this DynamoDB table", "why does this order look wrong in Dynamo", "show me the data model for this table", "set up dynomatic mcp in codex"

```bash
claude mcp add dynomatic -- /Applications/Dynomatic.app/Contents/MacOS/dynomatic mcp
codex mcp add dynomatic -- /Applications/Dynomatic.app/Contents/MacOS/dynomatic mcp
```

The app must be running with Settings -> MCP Server enabled. [tools.md](dynomatic-query/tools.md) lists the read-only, gated, and write tool groups and the bounded read pattern. Checked against Dynomatic 1.2.0; live tool schemas win.

### [pr-automation](./pr-automation/)

Creates or updates the current branch's PR, rewrites a named PR description, or prepares a local preview. Keeps the body short: what changed and why, a few behavior bullets, up to three critical-file review notes, and actual validation. Uses an installed Humanizer skill when available and Excalidraw for flows that need a diagram, with mer-inkdrop as the backup. Description-only updates do not commit or push; delivery stages scoped work and preserves manual PR notes.

> "create a PR", "push these changes and update the PR", "rewrite this PR description", "draft a PR description with an Excalidraw flow"

```text
Use pr-automation to create or update this PR. Base: develop.
Reviewers: alice. Diagram: auto. Keep it short.
```

See the [description template and examples](pr-automation/description.md) and [diagram workflow](pr-automation/diagrams.md). Use `diagram: always` to request a diagram or `diagram: off` to skip it. Existing Humanizer/Excalidraw/mer-inkdrop tools are discovered, not installed. [mer-inkdrop](https://github.com/thisguymartin/mer-inkdrop) renders through mermaid.ink, so backup diagram source must be sanitized; keep its `.mmd` source and inspect the rendered image before including it. Missing diagram access is reported explicitly.

### [security-scan](./security-scan/)

Security review of a PR, diff, file, directory, or whole service in any stack. Detects server vs browser surface from the files, traces every entry point's auth chain, and reports only findings confirmed by reading the code: authz on the wrong resource, permitted-id lists ignored, identity dropped in child containers, unguarded reference resolvers, search indices escaping authz, stale identity claims, cached personalized responses, public build-time secrets. Every finding gets severity, OWASP code, the corroborating signal, impact, and a code fix in about 120 words. Read-only.

> "security review this PR", "audit this service for vulnerabilities", "is this safe to ship", "look for auth gaps in this diff", "check for XSS and data exposure"

```bash
gh pr diff 123
git diff main...HEAD
```

[backend.md](security-scan/backend.md) covers handlers, RPC, GraphQL federation, events, IaC, and integrations including LLM tool access. [frontend.md](security-scan/frontend.md) covers XSS sinks, middleware matchers, server actions, client over-serialization, caching leaks, and framework config. Both load only when the target contains that surface.

### [notion-brain](./notion-brain/)

Saves research, plans, cloud/cost evidence, and artifacts as one organized record in Martin's Brain. Reads and summarizes saved decisions and open questions for later planning, or updates a named entry with dated evidence. Uses the live database fields and existing tags; no new database or automatic capture. Local artifacts can be attached directly to Notion when its upload tools are available.

> "save this research and artifact to my brain", "pull prior context from Martin's Brain before planning", "update this entry with the new findings"

```text
cloud-investigate + gather-context -> plan-artifact -> notion-brain save
notion-brain recall -> project-research -> a plan grounded in prior decisions
```

See [chained prompts and failure behavior](docs/notion-brain-workflow.md). Asking to preview a record stays local; asking to save it authorizes one Notion record. Skill creation and installation do not create live records.

## Check the repo

```bash
npm run check
npm test
```

[Scenarios](docs/examples/scenarios.md) cover expected agent behavior, including PR scope, repeated updates, preserved notes, and diagram gaps; automated checks cover packaging, renderer, history filters, GitHub CLI argument safety, and provenance tooling. AWS and PR command examples are checked against official docs; PR delivery and attachment behavior still need live usage. Synthetic fixtures only; no live AWS, Vantage, Linear, Notion, Slack, or GitHub writes are used for tests.

See [upstream research](docs/upstreams.md), [compatibility](docs/compatibility.md), [verification and limits](docs/verification.md), and [third-party notices](THIRD_PARTY_NOTICES.md). Original skills/scripts are [MIT](LICENSE); adaptations retain Notion's and Yaak's MIT notices. Excalidraw is retained local material with its source/license status documented separately.
