# thisguyskills

My research toolkit for coding agents. Understand a project, pull context from the tools I use, explain it with diagrams, turn it into an HTML plan, and save useful work in Martin's Brain in Notion.

```text
Repo + GitHub + Linear + Notion + Drive + Slack + cloud evidence
  -> gather-context -> project-research -> plan-artifact
Research + plan + artifact -> notion-brain save -> one Martin's Brain record
Martin's Brain -> notion-brain recall -> context for the next plan
Past Claude/Codex discussions -> session-history -> relevant decisions
Saved API requests -> yaak-query -> endpoint evidence
A diagram I want to annotate -> excalidraw
```

Each skill works on its own. The arrows are useful combinations, not required dependencies. Existing artifact builders and artifact-upload still work alongside these skills. Research ends at an explanation or plan unless the request includes saving to Notion. Implementation and public publishing need their own authorization.

## Install the skills

From this checkout, including changes that have not been pushed:

```bash
npx skills add . -a claude-code codex --skill project-research gather-context plan-artifact session-history cloud-investigate notion-brain yaak-query excalidraw
```

Add `-g` for a global install. From GitHub, after these changes are published:

```bash
npx skills add thisguymartin/skills -g -a claude-code codex --skill project-research gather-context plan-artifact session-history cloud-investigate notion-brain yaak-query excalidraw
```

| Skill | Individual install selector |
|---|---|
| [excalidraw](#excalidraw) | `--skill excalidraw` |
| [project-research](#project-research) | `--skill project-research` |
| [gather-context](#gather-context) | `--skill gather-context` |
| [plan-artifact](#plan-artifact) | `--skill plan-artifact` |
| [session-history](#session-history) | `--skill session-history` |
| [cloud-investigate](#cloud-investigate) | `--skill cloud-investigate` |
| [notion-brain](#notion-brain) | `--skill notion-brain` |
| [yaak-query](#yaak-query) | `--skill yaak-query` |

These commands are documented, not run automatically. Installing this collection does not remove previously installed skills with old names; see [compatibility](docs/compatibility.md) for migration.

## What I need installed

Use existing CLI tools first. Cloud investigation runs `aws` directly; saved endpoint queries run `yaak` directly. Optional scripts live inside the skill that uses them. `<skill-dir>` in examples means the installed skill folder (or its folder in this checkout).

| Skill | Required for the task | Optional |
|---|---|---|
| project-research | Repo/files or accessible sources | `git`, `rg`, current-docs/web tools, connected MCPs, existing artifact skill |
| gather-context | Access to the sources being researched | GitHub CLI (`gh`) + Node for its shortcut; Linear/Notion/Drive/Slack MCPs |
| plan-artifact | Node 22.18+ for the bundled renderer, browser to view HTML | Existing HTML/artifact builder; artifact-upload when sharing is requested |
| session-history | Node 22.18+ and local Claude Code or Codex history | No MCP needed; `--root` supports a local export location |
| cloud-investigate | AWS CLI v2 + authenticated profile for AWS reads | Vantage MCP for costs; Datadog/Mixpanel or other connected telemetry |
| notion-brain | Connected Notion read tools; page-write access for saves/updates | Notion attachment tools for requested local artifacts; existing research/artifact outputs |
| yaak-query | Yaak desktop collection + `@yaakapp/cli`; Node/npm to install the CLI | `jq` for local projections/redaction; existing Yaak MCP or official use-yaak skill |
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

[Scenarios](docs/examples/scenarios.md) cover expected agent behavior; automated checks cover packaging, renderer, history filters, GitHub CLI argument safety, and provenance tooling. AWS command examples are reviewed against official docs, not executed against live resources in tests. Synthetic fixtures only; no live AWS, Vantage, Linear, Notion, or Slack writes are used for tests.

See [upstream research](docs/upstreams.md), [compatibility](docs/compatibility.md), [verification and limits](docs/verification.md), and [third-party notices](THIRD_PARTY_NOTICES.md). Original skills/scripts are [MIT](LICENSE); adaptations retain Notion's and Yaak's MIT notices. Excalidraw is retained local material with its source/license status documented separately.
