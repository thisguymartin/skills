# Investigation checklist

Use the relevant checks; this is a search guide, not a requirement to inspect every subsystem.

| Question | Evidence to inspect |
| --- | --- |
| What happens today? | Existing route/surface, user action, UI state, request/response, tests, safe runtime observation |
| Where does it happen? | Component -> state/helper -> API/resolver -> domain model -> persistence; trace both ends of a contract |
| Why? | Conditions/branches, permission rules, feature flags, commit history, issue discussion, ADR rationale |
| What concepts exist? | Models, value objects, ownership, lifecycle, glossary; overloaded names such as report/query/search |
| What constrains a change? | Auth, tenancy, API consumers, compatibility, retention, deployment boundaries, existing invariants |
| Was this attempted? | Related open/closed issues, PRs, git history, TODOs, specs, docs |
| Which claims remain unproved? | Unavailable service/tool, missing flag value, untested deployed revision, incomplete pagination |

Record evidence as `E-01: claim — source path + symbol + inspected revision, issue/comment URL, or dated observation`. Prefer stable permalinks when available; never manufacture a permalink or line number. Include enough surrounding context to support the claim. A repository search cannot prove there are no external consumers.

Keep a small evidence ledger:

| Type | Statement | Source / rationale | Confidence / limitation |
| --- | --- | --- | --- |
| FACT | Reopening reevaluates a rolling date window | Actual code/test reference | High for this revision; live deployment unverified |
| INFERENCE | Users may expect a snapshot | Relevant feedback | Medium; validate product intent |

The conclusion should separate symptom, cause, impact, and recommendation. If the root cause is unknown, report it as unknown. Prefer a narrow follow-up over filling the gap with a plausible story. Do not reproduce customer data in fixtures or export it to additional AI services.
