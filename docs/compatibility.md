# Compatibility and installation

Checked 2026-09-08 against the [Agent Skills specification](https://agentskills.io/specification), [official Codex skill documentation](https://developers.openai.com/codex/skills/), [Claude Code skill documentation](https://code.claude.com/docs/en/skills), and [Skills CLI documentation](https://github.com/vercel-labs/skills). Confidence: high for the tested installer and documented local discovery; native invocation across both clients has not been smoke-tested here.

Every skill uses standard `name`, `description`, and `license` frontmatter plus Markdown and relative references. No host-specific hooks, model restrictions, tool allowlists, or mandatory MCP server names. The runtime chooses how to invoke skills and ask questions. Each entrypoint is useful on its own; the full router expects the other shaping capabilities to be installed.

| Host | Personal skills | Project skills | Explicit use |
| --- | --- | --- | --- |
| Codex | `~/.agents/skills/<name>/` | `.agents/skills/<name>/` | `$issue-workflow` or ask to use the named skill |
| Claude Code | `~/.claude/skills/<name>/` | `.claude/skills/<name>/` | `/issue-workflow` or ask to use the named skill |

Both documented local discovery mechanisms support symlinked skill directories. A root `skills/` checkout is the source tree; it is not automatically registered in an unrelated product repository. Some tools also support other or legacy locations; use the current host docs for those.

## One-command install

Use the existing Skills CLI with **Node 22.20+**, the minimum declared by the checked `skills@1.5.25` release. To install all nine skills for Codex and Claude Code from this repository's root:

```bash
DISABLE_TELEMETRY=1 npx skills@latest add . -g -a codex claude-code -s '*'
```

The intended GitHub remote is `thisguymartin/skills`. Once published there, the equivalent command from any directory is:

```bash
DISABLE_TELEMETRY=1 npx skills@latest add https://github.com/thisguymartin/skills -g -a codex claude-code -s '*'
```

| Want to install… | Change |
| --- | --- |
| Only for Codex | Use `-a codex` |
| Only for Claude Code | Use `-a claude-code` |
| Only selected skills | Replace `-s '*'` with names, such as `-s investigate-issue handoff` |
| Into one product project | Run from that project's root, use the absolute path to this checkout or the published GitHub source, and omit `-g` |
| Nothing yet; preview available skills | Run `npx skills@latest add . --list` from this checkout |

`-g` selects a personal install; `-s '*'` selects all nine skills. Target agents explicitly: `--all` also selects every agent supported by the installer. `DISABLE_TELEMETRY=1` opts out of the installer's [telemetry](https://www.skills.sh/docs/cli#telemetry). Use that prefix on subsequent CLI commands too if desired.

The installer copies complete skill directories into its managed locations and can link them for other hosts. A local-path install is a snapshot, not a live link to this checkout; rerun the same command after edits. Project installs also create `skills-lock.json`. Start a fresh agent session and use `$issue-workflow` in Codex or `/issue-workflow` in Claude Code.

Existing same-name skills can be replaced, including a generic name such as `handoff`. Use the manual option below when you need to skip existing entries. Copying just `SKILL.md` is incomplete: references and license notices belong with the entrypoint.

Tested `skills@1.5.25` on Node 22.20.0 in an isolated temporary project, targeting Codex and Claude Code together. All nine skills installed, all 32 source files matched byte-for-byte, and all nine Claude links resolved to the installed copies. This verifies installation output, not native client invocation. No global skills were installed. `@latest` tracks future CLI releases; this record names the version actually checked.

For GitHub-sourced installations, the CLI supports selected updates, for example:

```bash
DISABLE_TELEMETRY=1 npx skills@latest update investigate-issue -g
```

That updates an installed skill from **this repository**. Reviewing and adapting changes from Matt Pocock and other sources remains a separate maintainer task using this repository's upstream tools.

## Remove installed skills

For a personal installation in both hosts, use the CLI's [named removal command](https://github.com/vercel-labs/skills#skills-remove):

```bash
DISABLE_TELEMETRY=1 npx skills@latest remove \
  issue-workflow investigate-issue shape-feature \
  design-user-flow wireframe-feature write-feature-spec \
  review-feature-spec publish-linear handoff \
  -g -a codex claude-code
```

Removal matches the listed names, not a GitHub repository identity. Check the selection before confirming, especially if a same-name skill now comes from another collection. Do not use `--all` or `-s '*'` to remove just this collection: those also select unrelated installed skills.

For only one host, keep only its name after `-a`. For a project installation, run from that product project's root and omit `-g`. Start a fresh agent session afterward. The source checkout and its product artifacts are separate from CLI-managed installed copies.

For manual development links created below, remove only the individual symlinks you created from the selected host's skill directory after checking their targets. Keep the source `skills/` tree. The CLI commands above cover CLI-managed installs; they are not a blanket cleanup of every possible manual setup.

## Manual development links that skip existing entries

This option needs no Node runtime and keeps edits connected to the checkout. Clone this repository wherever you keep tools. From its root, choose the destination for your host and run:

```bash
# Codex personal install. For Claude Code, use "$HOME/.claude/skills".
skill_destination="$HOME/.agents/skills"
skill_source="$PWD/skills"
mkdir -p "$skill_destination"
for skill in issue-workflow investigate-issue shape-feature design-user-flow wireframe-feature write-feature-spec review-feature-spec publish-linear handoff; do
  if [ -e "$skill_destination/$skill" ] || [ -L "$skill_destination/$skill" ]; then
    printf 'Skipped existing skill: %s\n' "$skill"
  else
    ln -s "$skill_source/$skill" "$skill_destination/$skill"
  fi
done
```

For a project install, choose the target product repo's absolute `.agents/skills` or `.claude/skills` path. Start a fresh session and confirm the host lists the skills. Do not copy just `SKILL.md`: keep references and bundled license notices. Symlinks keep updates tied to the checkout; copying a whole skill is also portable but requires manual synchronization.

Names such as `handoff` can collide with existing collections. The loop deliberately skips all existing entries, including broken symlinks. Resolve collisions consciously; invoke a specific source path when necessary instead of silently overriding another skill. Do not rename only the folder: the frontmatter name must match it. See the host docs for namespace and precedence behavior.

## Native Codex plugin commands

The checked Codex CLI, `0.153.4`, offers `codex plugin marketplace add` and `codex plugin add`; there is no `codex install` command. Those commands install marketplace plugins. This repository currently distributes standard skills through the Skills CLI or manual links, so it does not need a custom installer or plugin manifest. Pstack still uses its own native plugin workflow below.

## Open Pstack remains native

Use [Open Pstack's own installation workflow](https://github.com/ericlitman/open-pstack#install). This repository does not install or configure Pstack. At the pinned research revision its Codex plugin workflow is:

```bash
codex plugin marketplace add ericlitman/open-pstack --ref main
codex plugin add pstack@open-pstack
```

Follow the upstream setup instructions for current model/subagent requirements and restart discovery as directed. The implementation starter is `Use pstack:poteto-mode.` In Claude Code the native slash form is `/pstack:poteto-mode`. No Pstack skill chain is reimplemented here.

## Linear capability discovery

Use the actual tools offered by the host. Read their schemas/help before fetching issues/comments/relations, searching related work, or writing issues. An exposed connector does not prove authenticated access or every supported mutation. Test reads within the actual task's scope.

Missing access does not block drafting. `publish-linear` returns complete ready-to-paste content and states what could not be published. No guessed API or credential setup is required. User authorization determines whether to write; an investigation-only request stays read-only.

## Research environment snapshot

The initial workspace was empty, with no Git metadata or local instructions, README, license, or skill trees. Linear MCP tools and a named Linear MCP configuration were present; no live issue was read or written for this repository task. No Pstack installation/reference was found in the checked user skill roots, plugin cache names, installed-plugin/marketplace records, or Codex plugin configuration. This is an inspection result, not proof of absence from every possible installation location. Existing global tools were left unchanged.

Skill usage itself needs no Node runtime. Repository validation/upstream maintenance tools use Node 22.18+ and Git; TypeScript runs through [Node's native type stripping](https://nodejs.org/docs/latest-v22.x/api/typescript.html) with no dependencies. Script execution was checked on Node 22.18.0 and Git 2.55.0. Type stripping executes the scripts; it does not perform static type checking.
