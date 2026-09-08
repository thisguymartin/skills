# Saved search run wireframe

Low fidelity; synthetic content. Visual revision: 1. Product authority: [spec.md](spec.md), revision 1. These frames add no behavior beyond D-01–D-07.

Pre-run, FLOW-01:

```text
+----------------------------------------------------------------+
| [Back to list]                                                  |
| Campaign contributions                                         |
| Query: Contributions to selected candidates                     |
| Window: Rolling 90 days                                        |
|                                                                |
| Results use current evidence when you run this saved search.    |
|                                                                |
| [Run saved search]                                              |
+----------------------------------------------------------------+
```

Loading, FLOW-01:

```text
+----------------------------------------------------------------+
| [Back to list]   Campaign contributions                         |
| Evaluating: Jan 1, 2026 00:00 UTC -> Apr 1, 2026 00:00 UTC       |
| Start included; end excluded                                   |
| Loading evidence...                                            |
| [Run saved search — disabled]                                  |
+----------------------------------------------------------------+
```

Complete: replace loading feedback with existing result-row presentation and retain the interval. Zero: show “No matching evidence” in place of rows. In both, Run becomes available again. Counts and rows are illustrative; no claim is made about real evidence totals.

Error, FLOW-02:

```text
+----------------------------------------------------------------+
| [Back to list]   Campaign contributions                         |
| Evaluation failed. No results are available for this run.       |
| [Retry]                                                        |
+----------------------------------------------------------------+
```

Unavailable, FLOW-03:

```text
+----------------------------------------------------------------+
| This saved search is unavailable.                              |
| [Back to list]                                                 |
+----------------------------------------------------------------+
```

Access failure hides the definition and results. Back works in every shown state. Re-entry returns to pre-run; no save/delete/share control is implied. Navigation and result rows use existing app conventions. The exact visual styling is not prescribed. ASCII layout was read for consistency; no HTML rendering or real UI validation was performed.
