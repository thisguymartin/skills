---
name: session-history
description: "Search local Claude Code and Codex conversation history to recover past decisions, user preferences, or useful workflows for research. Use when the user asks about previous discussions or wants patterns grounded in their own sessions."
license: MIT
---

# Session history

Recover relevant context without dumping an entire chat archive. Local Claude Code files are not the same as claude.ai web conversations; do not claim access to the latter.

## Inputs and workflow

Take a topic/query and optional project/date/session. The user's request to examine past discussions authorizes relevant local reads. Otherwise ask before searching private history. Use index/prompts first; inspect the narrow matching session only if it changes the answer.

```bash
node <skill-dir>/scripts/search-history.ts --query "research artifact" --provider claude --limit 10
node <skill-dir>/scripts/search-history.ts --query "retry" --provider claude --project /path/to/project --session <id> --messages --limit 10
node <skill-dir>/scripts/search-history.ts --query "feature plan" --provider codex --project /path/to/project --limit 10
```

The helper reads Claude's history.jsonl index or Codex's local session JSONL, using literal case-insensitive words (all must match). --messages requires a session ID, retrieves only user/assistant text, and never emits tool results or hidden reasoning. Run --help for file/byte bounds, --since, --root and --max-files. Missing history is distinct from zero matches; malformed or oversized input is counted in coverage.

1. Search the smallest useful scope. If there are many matches, narrow the project/date/topic. Prefer explicit user decisions over an assistant's suggested approach.
2. Retrieve only enough surrounding user/assistant text to understand the decision. Keep session ID, timestamp, project, file and line. An index prompt may refer to missing pasted text or deleted session files; do not reconstruct that content as fact.
3. Separate request, proposal, accepted decision, execution evidence, and unresolved ideas. History may be outdated; verify repo/access/live facts cheaply when relevant.
4. Explain the reusable pattern and what it changes in the current task. Use minimal sanitized excerpts only if needed. Do not turn one context-specific preference into a universal rule.

## Output and stopping condition

Return a short sourced readout or local note: useful decisions/patterns, exact session locators, conflicts, freshness, and coverage gaps. Never publish transcripts, raw tool output, secrets, customer data, or quoted private messages. Use synthetic fixtures when testing this skill. Stop once the relevant prior decision is understood or the archive cannot support it. Memory updates and global agent configuration are separate user requests.
