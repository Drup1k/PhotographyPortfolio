---
name: code-validation
description: "Review generated or modified project code before it is accepted. Use when asked to validate, review or check code."
---

# Code Validation

Review newly generated or modified code before it is accepted into the project.

## Process

1. Identify what was changed.
2. Check whether the change matches PLAN.md and the requested task.
3. Check whether the code can compile or run.
4. Check the logic for obvious errors.
5. Check input validation and error handling where relevant.
6. Check for unnecessary complexity or dependencies.
7. Check relevant accessibility and security concerns.
8. Explain any important findings clearly.

## Validation questions

Before approving the change, answer:

- Does the code compile or run?
- Does it do what was requested?
- Is the code understandable?
- Is unnecessary complexity avoided?
- Are obvious security problems avoided?
- Can the developer explain the important parts of the implementation?

## Output

Finish with one of:

- Ready
- Ready with suggestions
- Changes required

When changes are required, explain the smallest useful change first.