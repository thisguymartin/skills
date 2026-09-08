# Working on thisguyskills

This repository owns feature shaping and product intent. Native Open Pstack owns technical execution. Keep that boundary explicit in every skill.

- Keep nine focused skill entrypoints unless a new responsibility earns its own skill. Load detailed references only when needed.
- Preserve independent use: each skill includes inputs, outputs, and stopping conditions. Sibling skills are optional helpers except when the full workflow requires their quality gate.
- Research upstream changes at exact revisions. Update provenance and license notices with adaptations. Never vendor Pstack or overwrite `skills/` from upstream tooling.
- Run `node scripts/validate-skills.ts` and `node --test scripts/tooling.test.ts`. Walk through `examples/scenarios.md` when behavior changes; structural validation does not prove agent behavior.
- Use synthetic data in fixtures. Do not modify live Linear issues to test these skills.
- Keep runtime-specific setup in `docs/compatibility.md`. Installing global skills, publishing this repository, and creating live issues are separate tasks.
- Commit only as Martin Patino <mpatino117@gmail.com>. Use a conventional subject under 72 characters and a detailed body explaining what, why, and non-obvious approach. Use bullets for multiple meaningful changes and reference tickets when available. Never add AI attribution, co-author trailers, or AI sign-offs.
