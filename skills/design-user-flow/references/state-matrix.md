# State matrix

Use this only when it exposes meaningful state coverage. Replace each cell with an observable response, available actions, and preservation/recovery behavior. Delete unused columns or mark a genuinely inapplicable state with its reason.

| Surface | Empty | Loading | Success | Error | Partial / stale |
| --- | --- | --- | --- | --- | --- |
| List | Initial explanation and permitted first action | Existing rows retained or replaced, as decided | Owned records and permitted actions | Failure copy and retry destination | Freshness shown; define allowed actions |
| Editor | Required fields and defaults from decisions | What is disabled and what remains editable | Saved-state confirmation and destination | Validation/save failure with retained inputs | Conflict response and recovery |
| Preview | Zero-result explanation | Evaluation feedback and cancellation | Results plus evaluated scope | Retry with the same or updated inputs, as decided | Incompleteness/freshness disclosure and action limits |

Also check: permission denied, removed target, user leaves and returns, retries after an uncertain save, and edits from two sessions. Do not assert unsupported persistence, autosave, or conflict resolution merely to fill a cell.
