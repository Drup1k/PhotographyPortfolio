---
applyTo: "**"
description: "Code review priorities for the Photography Portfolio"
---



<!-- Inspired by: https://github.com/github/awesome-copilot/blob/main/instructions/code-review-generic.instructions.md -->
# Code Review

When reviewing code, prioritize findings in this order:

## Critical

Issues that can cause:

- security vulnerabilities;
- exposed secrets;
- incorrect application behavior;
- data loss;
- broken frontend/backend contracts.

## Important

Issues involving:

- duplicated or unnecessarily complex code;
- missing validation;
- significant accessibility problems;
- important missing tests;
- obvious performance problems.

## Suggestions

Non-blocking improvements involving:

- naming;
- readability;
- small refactoring opportunities;
- documentation;
- minor performance improvements.

## Review behavior

For every important finding:

- explain what the problem is;
- explain why it matters;
- identify the relevant file or code;
- suggest a simple improvement.

Do not propose major refactoring unless it provides a clear benefit to the current task.