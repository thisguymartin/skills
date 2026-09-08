# Draft update for synthetic ENG-123: clarify running a saved search

Publication: unavailable in this fixture; no live issue or URL exists.
Readiness: reviewed synthetic contract, spec revision 1. [Review](review.md).

## Existing context retained

Users confuse rerunning searches with previously exported packets. Keep old saved-search links working. Support context: a user expected Open report to show last week's results. The product owner requires private ownership; engineering confirms rolling-day reevaluation. Related synthetic ENG-98 already covers packet export.

## What changes

Rename the list Saved searches. Opening an owned saved record at any existing record route shows its name/query/rolling strategy and explains that results use current evidence. The explicit Run saved search action begins evaluation; opening the record alone does not.

For rolling N days, each run fixes a UTC interval from its start instant minus N 24-hour days (inclusive) to that instant (exclusive). Show that evaluated interval during loading and success, including zero matches. Loading replaces earlier rows and disables repeat Run. Failure/incomplete evaluation shows error with no rows; Retry starts a fresh interval. Zero results are a completed run, not an error.

Access remains owner-only. Removed records and permission loss produce generic unavailable without definition/results. Back to list works in every record state. Leaving/reloading abandons the transient run; re-entry starts at access-checked pre-run. Saved definitions and existing packets remain unchanged. Old record routes and packet links continue working; packet behavior does not change.

## Acceptance criteria

- REQ-001 / AC-001–002: list uses Saved searches; owned-record pre-run shows the definition/strategy and current-evidence explanation before evaluation.
- REQ-002 / AC-003: direct entry does not run; explicit Run starts evaluation.
- REQ-002 / AC-004: a 90-day run starting Apr 1, 2026 00:00 UTC displays/evaluates [Jan 1, 2026 00:00 UTC, Apr 1, 2026 00:00 UTC).
- REQ-003 / AC-005: loading hides prior rows and disables repeat Run.
- REQ-003 / AC-006: successful complete results show the interval fixed at start.
- REQ-003 / AC-007: zero matches displays No matching evidence plus that interval.
- REQ-004 / AC-008: failed/incomplete evaluation shows error with no result rows.
- REQ-004 / AC-009: later Retry starts a new evaluated interval.
- REQ-005 / AC-010: a nonowner using a direct link/request receives no definition/results.
- REQ-005 / AC-011: removal or permission loss during a run produces generic unavailable on the next response.
- REQ-006 / AC-012: Back works from pre-run, loading, complete, zero, error and unavailable.
- REQ-006 / AC-013: reload returns to access-checked pre-run rather than resuming.
- REQ-006 / AC-014: run/retry/leaving never changes saved definitions or packets.
- REQ-007 / AC-015: old record URLs remain valid and reach pre-run at the same URL.
- REQ-007 / AC-016: packet links retain their frozen content and existing behavior.

## Scope and dependencies

No create/edit/delete/share/scheduling flow, new report entity, packet-generation changes, data migration or new analytics infrastructure. Existing result-row presentation and list loading/error behavior remain. No blocking product questions in this fixture. The old vague “Reusable reports?” intent is narrowed by supplied decisions D-01–D-07; earlier support context remains useful.

## References and handoff

[Spec](spec.md), [wireframe](wireframe.md), [decisions and original issue](../fixtures/context.md), [handoff](handoff.md). These are files in this example checkout, not shared production links. The critical contract is included above so the issue body is readable independently. Actual team/project/ID and accessible artifact links must be selected in a real publication task.

Use native `pstack:poteto-mode` only when implementation is requested. It owns technical strategy and real-app verification. This draft does not publish an issue or start implementation.
