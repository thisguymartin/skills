# Synthetic product context

All names, issue IDs, facts, and decisions here are fixtures. These are not live Linear issues. The TypeScript fixture describes current behavior; no application or database is supplied.

## Domain and evidence

[product.ts](product.ts) contains `SavedSearch`, `ExportedPacket`, `reopen`, `makePacket`, and current screen copy. Reopening is owner-only and computes a rolling interval at execution time. A packet freezes a copy of the selected item IDs. The UI calls a saved search a report and explains neither reevaluation nor the interval.

No usability study or usage metric is supplied. Any claim about how often people are confused is unverified. No real app, live service, test suite, or Git history for this synthetic product is supplied.

## Existing Linear fixture

ID: ENG-123. Title: Reusable reports?

Description: Users confuse rerunning searches with previously exported packets. Keep the old saved-search links working. Related export work is ENG-98. Support context: a user expected Open report to show last week's results.

Comment from product owner: Keep private ownership for v1. Existing saved searches must keep working.

Comment from engineer: Current `rollingDays` is reevaluated on reopen. Packet output freezes IDs; see ENG-98.

Related ENG-98: packet export already exists. Status: completed in this fixture.

Do not discard these comments or claim a public URL for these synthetic identifiers. Linear publishing is unavailable in these scenarios.

## Product decisions supplied only when the scenario says so

For the worked UI example, the product owner has decided:

- D-01: Keep the saved search and immutable packet concepts. This change only clarifies reopening an existing saved search. No new report entity or creation/editing UI.
- D-02: Label the action “Run saved search.” Before execution, say that results use current evidence and a rolling window. Once evaluation starts, show its fixed evaluated interval in UTC. Retrying starts a fresh evaluation with a new interval.
- D-03: Display zero, loading, error, and complete states. This surface does not support partial results; incomplete evaluation is an error with no result rows.
- D-04: Permission loss or a removed search shows a generic unavailable state with Back to list; expose no definition or results. Leaving/reloading abandons the transient run. It does not change the saved definition or existing packets.
- D-05: While one run is loading, disable repeat Run. A failed run can retry; retry replaces the displayed run. No packet generation or mutations are added by this feature.
- D-06: Keep old saved-search routes functional. Opening a list record through any existing route shows the clarified pre-run view; run starts only after the explicit action. Existing packet links and packet content remain unchanged.
- D-07: The list uses “Saved searches.” The pre-run view shows the existing name, query, and rolling-day strategy. A run covers the UTC interval from its start instant minus N 24-hour days, inclusive, to its start instant, exclusive. A loading/new run replaces old results; zero matches is a completed run. Back to list is available during loading and every terminal state. Existing result-row presentation is reused.

These decisions are fixture authority for the worked example, not defaults that should be assumed in the vague-idea scenario.
