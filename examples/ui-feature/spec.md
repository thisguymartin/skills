# Clarify running a saved search

Status: ready within this synthetic fixture only
Spec revision: 1
Source: synthetic ENG-123; unpublished
Review: [review.md](review.md), revision 1

## Summary and problem

An owner can tell that running a saved search evaluates current evidence, while an exported packet preserves a prior selection. Clarify the existing list and run journey. Creation, editing, and packet generation are outside this change.

FACT: [product.ts](../fixtures/product.ts) defines an owner-only `reopen` that computes a rolling interval from the current time, and `makePacket` that freezes selected item IDs. Its `screenCopy` calls the list “Saved reports” and gives no date explanation. Confidence: high for the supplied source, unverified in any deployed application.

FACT: the [synthetic issue and comments](../fixtures/context.md) require private ownership and compatibility with old links; ENG-98 covers export. The supplied support anecdote suggests confusion between rerunning and frozen output. INFERENCE: unclear labels and missing time context contribute to the confusion. Frequency and prevalence are unknown; no research data was supplied.

## Actor, goal, and scope

Actor: the saved search's owner. Goal G-01: predict whether opening/running a saved search refreshes results, and see which interval a run evaluated.

Include the saved-search list wording, pre-run explanation, explicit Run action, evaluated interval, and relevant loading/complete/empty/error/unavailable states. Keep private ownership and existing search/packet links. Exclude new report entities, create/edit/delete/share flows, scheduling, packet generation changes, new analytics infrastructure, and a full visual redesign.

## Accepted decisions

[Fixture decisions D-01 through D-07](../fixtures/context.md) are the product authority. A saved search preserves its existing query and rolling-day strategy; a run is transient; a packet remains immutable. Existing record routes enter the pre-run view. Retry begins a fresh run rather than replaying a frozen interval. No product questions remain for this bounded example.

## Flow and UX states

FLOW-01: Saved searches list -> select owned record or follow existing record link -> pre-run view -> Run saved search -> loading -> results with evaluated UTC interval, including an explicit zero-result outcome.

FLOW-02: loading -> incomplete/failed evaluation -> error with no result rows -> Retry -> a new loading run with a newly evaluated interval.

FLOW-03: any record view -> permission lost or record removed -> generic unavailable -> Back to list. No definition or results are disclosed in the unavailable state.

FLOW-04: any record state -> Back to list -> list. Reload/direct re-entry begins at pre-run after access is checked. Leaving abandons the transient view, with no change to saved definitions or packets.

| State | Visible content | Actions | Preservation |
| --- | --- | --- | --- |
| Empty list | No saved searches and existing empty-list explanation | Existing permitted navigation | No writes |
| Pre-run | Name, query, rolling strategy; “Results use current evidence when you run this saved search.” | Run saved search; Back to list | Existing definition unchanged |
| Loading | Evaluated UTC interval and loading feedback; no previous result rows | Run disabled; Back to list | One active displayed run; no saved changes |
| Complete | Current result rows and evaluated UTC interval | Run saved search again; Back to list | No saved changes |
| Zero matches | No matching evidence and evaluated UTC interval | Run saved search again; Back to list | Zero is a completed run |
| Error / incomplete | Evaluation failed; no result rows | Retry; Back to list | Definition unchanged; retry uses a new interval |
| Unavailable | Generic unavailable message; no definition/results | Back to list | No data exposed |

There are no editable fields, destructive actions, or partial-success state in this feature. Existing list loading/error behavior remains unchanged. The [wireframe](wireframe.md) illustrates FLOW-01/02/03 with the same state names.

## Requirements and acceptance criteria

All requirements support G-01, including its privacy and compatibility constraints.

| Requirement | Product behavior | Source / flow | Criteria |
| --- | --- | --- | --- |
| REQ-001 | List is labeled Saved searches; owned-record routes show a pre-run view with name/query/rolling strategy and current-evidence explanation | D-01/02/06/07; FLOW-01 | AC-001, AC-002 |
| REQ-002 | Only an explicit Run starts evaluation; each run fixes its UTC interval from start minus N 24-hour days (inclusive) to start (exclusive) and shows it | D-02/06/07; FLOW-01 | AC-003, AC-004 |
| REQ-003 | Loading replaces previous rows and disables repeat Run; complete/zero states display the evaluated interval | D-03/05/07; FLOW-01 | AC-005, AC-006, AC-007 |
| REQ-004 | Failed/incomplete evaluation shows error without rows; Retry starts a fresh interval | D-02/03/05; FLOW-02 | AC-008, AC-009 |
| REQ-005 | Owner-only access remains; removed records or permission loss show generic unavailable with no definition/results | D-04; FLOW-03 | AC-010, AC-011 |
| REQ-006 | Back is available in every record state; leaving/reloading abandons the transient view and never mutates definitions/packets | D-04/07; FLOW-04 | AC-012, AC-013, AC-014 |
| REQ-007 | Old saved-search routes and packet links remain valid; packet content and behavior are unchanged | D-01/06; FLOW-01/04 | AC-015, AC-016 |

- AC-001 -> REQ-001: Entering the existing list shows the title Saved searches.
- AC-002 -> REQ-001: Opening an owned record displays its name, query, rolling-day strategy, and current-evidence explanation before any evaluation.
- AC-003 -> REQ-002: Opening the record alone starts no evaluation; activating Run starts evaluation.
- AC-004 -> REQ-002: Starting a 90-day run at 2026-04-01 00:00:00 UTC displays/evaluates [2026-01-01 00:00:00 UTC, 2026-04-01 00:00:00 UTC).
- AC-005 -> REQ-003: While loading, previous result rows are absent and repeat Run is disabled.
- AC-006 -> REQ-003: A successful run displays its complete results with the interval fixed when that run started.
- AC-007 -> REQ-003: A completed run with zero matches displays No matching evidence and the evaluated interval.
- AC-008 -> REQ-004: Failed or incomplete evaluation displays an error without presenting any rows as results.
- AC-009 -> REQ-004: Retrying later evaluates and displays a new interval based on the retry start instant.
- AC-010 -> REQ-005: A nonowner entering an existing record URL cannot obtain the definition or results.
- AC-011 -> REQ-005: If access is lost or the record is removed during a run, the next response displays generic unavailable without the definition/results.
- AC-012 -> REQ-006: Back to list works from pre-run, loading, complete, zero, error, and unavailable states.
- AC-013 -> REQ-006: Reloading a record returns to the access-checked pre-run state without resuming the prior run.
- AC-014 -> REQ-006: After a run, retry, or navigation away, the saved definition and existing packets have not changed.
- AC-015 -> REQ-007: Following an old saved-search record URL reaches the access-checked pre-run view at the same URL.
- AC-016 -> REQ-007: An existing packet link still opens its original frozen content with unchanged packet behavior.

## Domain, integration, and compatibility

Reuse the established SavedSearch/ExportedPacket language and owner boundary; “run” is the current evaluation. This specification does not require a new aggregate, persistence layout, API shape, cloud, or framework. Navigation hints are the fixture's `reopen`, `makePacket`, and `screenCopy`; real code locations and deployment behavior must be re-established in the implementation workspace.

No data migration is requested. Preserve current query and rolling-day values and packet immutability. Existing export work is related context, not a new prerequisite ticket. Cross-tenant access must not expand. Pstack chooses how to handle in-flight requests and verify access while meeting the observable contract.

## Success, risk, and handoff

Success is that the explicit pre-run explanation and displayed interval make freshness visible. No adoption baseline or numeric improvement target has been measured; a follow-up usability check can assess whether owners correctly distinguish current runs from packets. This is a proposed measurement, not an invented launch threshold.

Risk: changing direct-entry behavior to require Run adds an action. D-06 explicitly accepts that tradeoff. Verify old links and authorization as well as the happy path. Code, tests, runtime checks, metrics and real Linear publication remain unperformed: this is a synthetic product contract.

Read [handoff.md](handoff.md) for native `pstack:poteto-mode` continuation. Pstack owns technical implementation and real-application verification against AC-001–AC-016.
