<!-- Inspired by: https://github.com/github/awesome-copilot/blob/main/instructions/csharp.instructions.md -->

---
applyTo: "**/*.cs"
description: "C# guidelines for the Photography Portfolio project"
---

# C# Development

Use clear, beginner-friendly and maintainable C#.

## Naming

- Use PascalCase for classes, methods and public properties.
- Use camelCase for local variables and parameters.
- Use descriptive names instead of abbreviations.

## Code structure

- Keep methods small and focused on one responsibility.
- Prefer simple solutions over advanced language features when both solve the problem clearly.
- Keep responsibilities separated between models, services, API logic and data access when those layers are introduced.
- Do not introduce architectural patterns unless they provide a clear benefit to the current task.

## Nullability and validation

- Respect nullable reference types.
- Validate external input before using it.
- Handle expected errors clearly instead of silently ignoring them.

## Comments

Prefer self-explanatory code.

Comments should mainly explain why something is done when the reason is not obvious. Do not add comments that simply repeat what the code already says.

## Learning

When introducing a C# concept that has not been used previously in the project, briefly explain why it is needed.