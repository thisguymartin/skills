# Wireframe guidelines

Choose fidelity by the unresolved question:

| Artifact | Useful for | Boundary |
| --- | --- | --- |
| Markdown/ASCII | Hierarchy, labels, placement, state comparison | Default, portable, no runtime |
| Mermaid state/flow diagram | Transitions, branches, relationships | Complements screens when UI exists |
| Standalone HTML | A sequence the reviewer needs to drive | Synthetic data, in-memory state, no production imports or remote services |
| Production design | Brand, detailed components, polished visual system | Explicit separate scope; do not imply a sketch settles it |

For existing UI, show enough surrounding context to explain placement. Keep unchanged navigation and controls consistent. Prefer one primary frame plus consequential alternate states to a gallery of cosmetic variants.

Example, assuming a decision to save a reusable query definition:

```text
+--------------------------------------------------+
| New evidence report                              |
| Name   [ Campaign finance                  ]     |
| Topic  [ Contributions                     v ]   |
| Scope  [ Selected people                   v ]   |
| Window [ Rolling 90 days                   v ]   |
|                                                  |
| Preview: results from the current evaluation      |
| [Illustrative synthetic result summary]          |
|                                                  |
| [Cancel]                            [Save report] |
+--------------------------------------------------+
```

Outside the frame, explain Save/Cancel, validation, zero results, loading, error, and permission states using flow IDs. A new control is proposed behavior until the written contract includes it. Do not insert implementation paths or review instructions into the product UI.

For HTML, use a self-contained file with no remote fonts, analytics, API calls, or dependencies. Make the essential paths actually clickable; mark unsupported actions explicitly. Keep visible prototype status outside the product frame. Check it at the intended screen size, with keyboard navigation if relevant. Record what was rendered versus only inspected as source.
