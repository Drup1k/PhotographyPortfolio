---
applyTo: "**/*.js,**/*.jsx,**/*.css"
description: "React and frontend guidelines for the Photography Portfolio"
---



<!-- Inspired by patterns from github/awesome-copilot React and frontend guidance -->
# Frontend Development

Build the frontend with React and JavaScript.

Do not convert the project to TypeScript unless explicitly requested.

## React

- Use functional components.
- Use hooks when state or React lifecycle behavior is needed.
- Keep components small and focused.
- Extract reusable components when this improves readability.
- Avoid unnecessary state and unnecessary complexity.
- Do not introduce external state-management libraries unless they are actually needed.

## Design

The website is a photography portfolio.

Photography should remain the visual focus of the interface.

Prefer:

- clean layouts;
- strong visual hierarchy;
- generous spacing;
- responsive image presentation;
- subtle interactions;
- consistent typography.

Avoid generic dashboard-style interfaces or excessive UI elements.

## Responsive design

Pages must remain usable on desktop, tablet and mobile.

Layouts should adapt naturally instead of simply shrinking desktop content.

## Images

Photography is core content and should be handled carefully.

- Preserve image aspect ratios.
- Avoid unnecessary image distortion or cropping.
- Use appropriate responsive image behavior.
- Lazy-load images when appropriate.
- Do not sacrifice image quality unnecessarily.

## Dependencies

Prefer React, CSS and browser functionality already available in the project.

Do not add UI frameworks, animation libraries or other packages unless they provide a clear benefit and their use has been explained first.