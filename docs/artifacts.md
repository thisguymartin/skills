# Feature artifacts

Artifacts belong in the product repository being shaped, not in this skill repository. Follow an existing convention; otherwise `.issuecraft/<issue-id-or-slug>/` is a useful default.

| Artifact | Owns | Create when |
| --- | --- | --- |
| `investigation.md` | Current behavior and evidence | Findings merit a durable record |
| `decisions.md` | Choices, rationale, assumptions, open questions | Decisions span sessions or several artifacts |
| `flow.md` | Behavioral paths and state coverage | More than a short inline flow is useful |
| `visuals/wireframe.md` or `.html` | Reviewable UI intent | UI hierarchy/interaction matters |
| `spec.md` | Accepted product behavior and criteria | A feature needs a durable contract |
| `review.md` | Findings and readiness for a particular version | A substantial feature reaches the quality gate |
| `linear.md` | Publication draft and confirmed IDs | Publishing, offline fallback, or multi-issue recovery needs it |
| `handoff.md` | Reading order and exact continuation | Another session or Pstack must resume |

Small features can keep decisions and flows inside `spec.md`. No empty directories or boilerplate placeholders. Use a slug before Linear exists; record the eventual ID without renaming everything. Read existing files before updating and preserve unrelated edits.

The spec is canonical product intent. Decisions explain why. Flows and visuals must agree with it. Linear carries a readable implementation-critical contract. The handoff references these durable sources rather than making another copy. A contradiction needs resolution, not a blanket rule to ignore the less convenient artifact.

Use `draft`, `blocked`, or `ready`. Ready means consequential product decisions are settled and the current substantial feature passed review. It says nothing about whether implementation works. Increment the spec revision when its contract changes, update affected artifacts, and renew the review. An unchanged revision label does not make a changed artifact's old review valid.

Local paths work only for an agent with that checkout. For another machine/session, reference a committed accessible revision, authorized shared document, or portable bundle. Do not commit/push/upload automatically to make links work. If nothing is shared, put the full necessary contract in the issue or report the transfer prerequisite. Never describe `/tmp` as permanent storage.

Use only synthetic data in prototypes and examples. Keep sensitive context local and minimize retained personal information. Do not send real customer records to additional third-party AI services.
