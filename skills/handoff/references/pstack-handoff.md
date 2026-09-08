# Native Open Pstack destination

Thisguyskills prepares the product contract. Native Open Pstack owns technical architecture, implementation strategy, code changes, test strategy, verification, code review, CI, PR preparation, implementation-session recovery, and implementation orchestration.

Use the template below only after the product quality gate passes. Replace placeholders with real references and omit files that were not needed or created.

```text
Use pstack:poteto-mode.

Implement the feature described in <real Linear issue or unpublished spec>.
Work in <repository/workspace and accessible revision>.

Read:
1. <Linear issue or complete issue draft>
2. <canonical feature spec and revision>
3. <flow, inline section or artifact>
4. <wireframe if UI-relevant>
5. <decisions and remaining nonblocking questions>
6. <review matching this version>

Treat the specification as product intent and accepted behavior.
Own the technical implementation strategy from this point forward.
Verify the resulting behavior in the real application against the acceptance criteria.
Surface a real contradiction or newly discovered product decision instead of
silently changing semantics to make implementation easier.

<Actual implementation authorization, constraints, and requested endpoint.>
```

Do not include a manual chain of Pstack skills. `poteto-mode` performs native routing. Do not make an issue ID a prerequisite when the user is intentionally implementing from an accessible local specification.

Check the host's available skills/plugin inventory. If Pstack is absent, provide this starter prompt and point to the [upstream native installation instructions](https://github.com/ericlitman/open-pstack#install); do not install, vendor, or impersonate it. Preserve the user's existing installation and model setup.

This handoff does not itself authorize implementation, commits, pushes, deployment, or PR publication. Carry forward the user's actual requested endpoint and existing authorization; do not add approval steps for work they already requested.
