# Vertical slices

Split when one issue contains several independently valuable journeys or is too large to implement and verify coherently. Keep a parent specification as the shared product contract; each slice has its own bounded behavior and acceptance criteria.

Example:

| Slice | Demonstrable outcome | Depends on |
| --- | --- | --- |
| Save a reusable report | Owner creates, saves, and reopens a definition | No other new slice |
| Edit a report | Owner changes and saves an existing definition with defined conflict behavior | Save/reopen |
| Generate a packet | Owner produces a frozen packet from a saved definition | Save/reopen; existing export capability |

Each slice crosses whatever layers it needs. Database/API/frontend/tests are implementation activities, not separate product slices. Do not mandate refactoring before value delivery. A real technical prerequisite can be named as a constraint; Pstack decides its implementation sequence.

For each proposed issue, include:

- Outcome and in/out-of-scope behavior.
- Parent spec/revision and the exact requirements it covers.
- Independently demonstrable acceptance criteria, including failure behavior.
- Real blocking edges and a clear completion boundary.

Review the parent-to-child coverage: every in-scope requirement has an owner, no child contradicts the parent, and dependency edges are acyclic. Distinguish “demonstrable on its own once prerequisites exist” from “has no dependencies.” Preserve deferred ideas without manufacturing ready implementation tickets for unresolved future behavior.

Use supported Linear parent/sub-issue or project relationships. If unavailable, use a parent issue with textual links; if no publishing mechanism exists, output parent and child Markdown drafts with provisional slice keys, never fake Linear IDs. Do not create a project/epic silently or close the original issue. Summarize the breakdown so the user can review it before publication.
