---
name: pr-automation
description: "Creates or updates GitHub pull requests with concise, humanized descriptions, critical-file review notes, honest validation, and Excalidraw diagrams with a mer-inkdrop backup for meaningful flows. Use when the user asks to create a PR, update a PR, rewrite its description, or prepare a local PR draft."
license: MIT
---

# PR automation

Turn the final change into a PR a reviewer can understand quickly. Detect the existing PR before changing git state. Describe the behavior, why it matters, and where a reviewer should look.

## Inputs and scope

Use the current repository/branch or a supplied PR URL/number. Accept an explicit base, file scope, issue/context, reviewers, labels, draft status, and desired length. `diagram: auto` is the default; `diagram: always` requests one and `diagram: off` skips it. These are request hints, not CLI flags.

Choose the mode from the request:

| Request | Action |
|---|---|
| "Create a PR", "open a PR", "push these changes and update the PR" | Deliver: verify and commit scoped pending work, push if needed, then create or update the same open PR. |
| "Update the description", "rewrite the title", "make this PR easier to read" | Describe: use the published PR diff; edit only the requested PR fields. No commits or pushes. |
| "Draft a PR description", "preview the PR" | Preview: prepare local title/body and any diagram. No commits, pushes, or GitHub writes. |

For "update the PR", deliver when the conversation identifies code changes to publish; otherwise describe. Honor narrower instructions such as "don't push". A draft **PR** is a GitHub write; a local preview is not. Do not use `gh pr create --dry-run` for a local preview: it may push.

This skill does not merge, deploy, perform a full code review, install tools/skills, or run Pstack. Humanizer, Excalidraw, and the mer-inkdrop diagram backup are optional helpers discovered at runtime; use the writing fallback below when Humanizer is absent. Diagram access limits do not block useful PR preparation.

## 1. Establish the target

Read repository instructions and any PR template. Use `git`, `rg`, and authenticated `gh`; consult installed help/current official docs for unfamiliar flags.

For local delivery, inspect branch, status, staged/unstaged/untracked changes, remotes, upstream, and HEAD. Resolve both the PR's target repository and the head repository/owner; they can differ in a fork. Do not assume `origin` is the push destination.

Fetch a supplied PR directly. Otherwise query open PRs for the head branch in the target repository:

```bash
gh pr list --repo <owner/repo> --head <branch> --state open --json number,url,headRefName,headRepository,headRepositoryOwner,baseRefName
gh pr view <number> --repo <owner/repo> --json number,url,title,body,state,isDraft,baseRefName,baseRefOid,headRefName,headRefOid,headRepository,headRepositoryOwner,statusCheckRollup
```

Filter by head repository/owner too; branch names alone are not unique across forks. Multiple matches need an exact target. A lookup/auth/network error is not "no PR". Only a successful empty result selects creation. Check closed/merged history for that head before reusing it; do not reopen or reuse a completed branch without an explicit request for new work.

For an open PR, its actual base is authoritative. For a new PR, use the explicit base, branch `gh-merge-base` configuration, then the target repository's default branch. Fetch the confirmed base; never silently compare against a stale local `main`. A requested base change on an existing PR must be explicit.

Before delivery from a default/protected branch, create a task branch. Detached HEAD or an unresolved target blocks delivery; finish a local description while requesting only the missing information.

## 2. Understand the complete change

For describe mode, read `gh pr diff <number> --repo <owner/repo>` and published commits/files. Ignore local edits and unpushed commits when writing about the published PR.

For deliver/preview, read the commit range and full merge-base diff against the confirmed base, plus scoped pending changes. Use `git log <base-ref>..HEAD`, `git diff <base-ref>...HEAD`, and separate staged/unstaged/untracked reads. Refresh the final diff after committing. If local HEAD differs from the published head, resolve that difference before presenting local evidence as published.

Trace enough surrounding code to explain the trigger, previous outcome, new outcome, and affected contract. Read relevant tests and issue context that is already available. Build the body around the complete final PR, not just the latest commit. Stacked PRs describe their own base-to-head change and link the prerequisite.

If there is no committed or scoped pending difference against the intended base, stop creation with "nothing to PR". An existing PR can still receive requested description edits.

Select at most three changed files that deserve special review: a public contract, authorization boundary, persisted data, migration, retry/idempotency rule, or central behavior. Each note says what to check and why. Omit the section when no file needs special attention; never list every modified file.

## 3. Verify and publish scoped code (deliver only)

Run checks appropriate to the change and the repository's instructions. Resolve relevant failures before delivery unless the user explicitly requests a draft with known failures. Keep passed, failed, pending, not run, and unrelated baseline failures distinct. Validation from an older/different head is not proof for this one. Describe/preview modes may report existing verified results and CI; they do not launch code changes or test repairs unless requested.

Stage explicit task paths/hunks only. Inspect the staged diff. Preserve unrelated staged and unstaged work; never use `git add -A`, reset, or stash the whole worktree. If unrelated paths are already staged, use a path-scoped commit or another non-destructive isolation method so they cannot enter the task commit. Ambiguous ownership within a file needs clarification before including it.

When a commit is needed, use git owner as author and committer. Use a conventional subject under 72 characters and a body explaining why/how, with bullets for distinct changes and issue IDs when known. Never include AI attribution or co-author/sign-off metadata. Fix relevant hook failures, inspect whether a commit was actually created, and retry only after resolving the failure; do not bypass hooks or amend without authorization.

Push the confirmed head branch to its existing upstream or verified head remote; set upstream only when absent. Do not push unrelated local commits. Verify the remote head equals the intended local HEAD. Never force-push, rebase, or retarget as a routine PR step. A rejected push stops publication; keep the prepared body and explain the actual error.

## 4. Write the description and diagram

Read [description.md](description.md). Follow a required repository template, keeping each answer short; otherwise use its small, adaptable template. Title: conventional format under 72 characters, unless the repository requires another style. Keep an existing accurate title. Rewrite it when explicitly requested or when delivery materially changes the PR's scope.

Lead with the concrete problem and resulting behavior. Add only useful change bullets, critical-file notes, validation, and material risks. Default to roughly 120-220 words for a medium PR; a small fix can be two sentences plus validation. Length is a guide, not a reason to omit a breaking contract or rollout step.

Discover the installed `humanizer` skill (some hosts expose `humanizer:humanizer`), read it, and use embedded mode on the final title/body/caption. Keep only the final prose. Preserve technical names, paths, commands, issue links, required template fields, and validation caveats. If unavailable, remove filler, inflated claims, repeated summaries, decorative labels, and chat residue yourself; do not install it or claim it ran.

Use [diagrams.md](diagrams.md): prefer Excalidraw, with mer-inkdrop as the backup when Excalidraw generation/export is unavailable or fails. In auto mode, draw when a changed request/data flow, queue/worker, state transition, or cross-service boundary is easier to review visually. Preserve editable source and a checked image; explain the changed step in one short caption. For a tiny change, skip the diagram unless requested. Honor an explicit Excalidraw-only request and identify any backup output accurately.

On updates, preserve manual reviewer notes, checklists and their checked state, issue links, and useful screenshots. Refresh stale generated explanations/testing/flow images from the final diff; avoid appending a second copy of each section. Save the existing body locally before replacing it.

## 5. Create or update once

Write the exact body with real newlines to a temporary Markdown file using a file-writing tool. Pass `--body-file`; never interpolate PR prose into shell commands. Resolve all placeholders before executing these command shapes:

```bash
gh pr create --repo <owner/repo> --base <base> --head <head> --title '<title>' --body-file <body-file>
gh pr edit <number> --repo <owner/repo> --body-file <body-file>
```

Use properly quoted literal values or argument arrays. Add requested create flags (`--draft`, `--reviewer`, `--label`); on edits use `--add-reviewer` / `--add-label` only when requested. Add `--title` only when rewriting it is in scope. Preserve existing draft status, reviewers, labels, and base unless asked to change them. Do not silently drop requested metadata to make an error disappear.

Immediately before a write, re-fetch the target PR/body/head. Reconcile new manual edits. If head/base changed, refresh the diff, validation claims, description, and diagram. Before creation, recheck for an open PR for that exact head so a repeat invocation updates it.

Attach a rendered diagram only through the verified route in diagrams.md. If any write times out or fails, inspect stdout and query GitHub before retrying: creation/attachments may partially succeed. Resolve the existing PR and retry only the missing operation; an unresolved outcome stays uncertain.

Fetch the PR after the write. Confirm URL, title/body, base/head, preserved notes/metadata, and any image links. Compare the published head with the intended head in deliver mode. Describe mode must leave the head unchanged. Check CI status without waiting for all CI unless requested.

## Outputs and stopping conditions

Finish with the PR URL and `created` or `updated`, plus a short validation status and any meaningful incomplete step. For preview, return the local title/body/scene/image paths and state that nothing was published. Avoid a skipped-step inventory for routine omissions.

Success means the intended PR content is fetched and verified, scoped code is published when requested, and diagram status is accurate. If blocked by auth, ambiguous scope, git rejection, or unresolved GitHub outcome, preserve the concrete local draft, name the blocker, and stop the affected write. Never report a prepared description or an unverified image as published.
