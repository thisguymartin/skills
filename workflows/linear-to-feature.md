# Linear to feature

Start: “Take ENG-123 and flesh this out before we build it.”

Read the current issue body, comments, attachments/relations relevant to the request, and related open/completed work. Inspect the actual code/product path. Missing Linear access means the current issue cannot be faithfully enriched until its content is available; do independent repository investigation meanwhile.

Use `investigate-issue` -> `shape-feature` for missing decisions -> `design-user-flow` -> conditional `wireframe-feature` -> `write-feature-spec` -> `review-feature-spec`.

Keep useful existing context. Do not reopen settled choices unless new evidence contradicts them. Once the current contract passes review, `publish-linear` merges the enrichment into a freshly read issue within the user's authorized scope and verifies the result. Do not alter unrelated status, assignee, project, or labels. Large features may need a parent and vertical slices; preserve the parent context.

Finish with `handoff`, linking the real issue, exact artifact revision, and next step. If the user only wanted a draft, return the draft. A local reference is not a link another Linear reader can open.
