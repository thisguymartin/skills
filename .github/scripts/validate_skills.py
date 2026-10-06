#!/usr/bin/env python3
"""Validate YAML frontmatter in every */SKILL.md.

Catches the class of bug where an unquoted value (e.g. `argument-hint: [...]`)
breaks YAML parsing and silently blocks skill installation.

Run locally: python3 .github/scripts/validate_skills.py
"""

import glob
import sys

import yaml

errors = []
skills = sorted(glob.glob("*/SKILL.md"))

if not skills:
    print("No */SKILL.md files found — wrong working directory?")
    sys.exit(1)

for path in skills:
    with open(path) as f:
        content = f.read()

    if not content.startswith("---\n"):
        errors.append(f"{path}: missing frontmatter (file must start with ---)")
        continue

    parts = content.split("---\n", 2)
    if len(parts) < 3:
        errors.append(f"{path}: unterminated frontmatter (no closing ---)")
        continue

    try:
        fm = yaml.safe_load(parts[1])
    except yaml.YAMLError as e:
        msg = str(e).splitlines()[0]
        errors.append(f"{path}: invalid YAML — {msg}")
        continue

    if not isinstance(fm, dict):
        errors.append(f"{path}: frontmatter is not a mapping")
        continue

    for field in ("name", "description"):
        if not fm.get(field):
            errors.append(f"{path}: missing required field '{field}'")

    dir_name = path.split("/")[0]
    if fm.get("name") and fm["name"] != dir_name:
        errors.append(f"{path}: name '{fm['name']}' does not match directory '{dir_name}'")

    for key, value in fm.items():
        if isinstance(value, (list, dict)):
            errors.append(
                f"{path}: field '{key}' parsed as {type(value).__name__} — "
                f"if the value starts with [ or {{, quote it"
            )

if errors:
    print(f"FAIL — {len(errors)} problem(s) in {len(skills)} skill(s):\n")
    for e in errors:
        print(f"  {e}")
    sys.exit(1)

print(f"OK — {len(skills)} skills validated")
