# discovery-plan-dark-mode.md

## 1. Introduction

This document outlines the technical discovery and implementation plan for adding a "dark mode" theme to the Screen Studio application. The goal is to leverage the existing CSS variable architecture to create a robust, maintainable, and visually polished theming system that can be easily toggled by the user.

## 2. Goals

-   Implement a high-quality dark theme that is consistent with the application's "high-craft" design principle.
-   Ensure the theming system is scalable and easy to maintain.
-   Provide a user-facing control to toggle between light and dark themes.
-   Ensure readability and accessibility (contrast ratios) are maintained in dark mode.

## 3. Scope

### In Scope

-   Auditing all CSS variables in `design-tokens.css` to identify which need dark theme variants.
-   Creating a new `themes.css` file to house the dark mode variable overrides.
-   Implementing a theme-toggling mechanism using a `data-theme` attribute on the `<body>` element.
-   Adding a toggle control to the `HeaderMenu`.
-   Creating a Jotai atom and a custom hook (`useTheme`) to manage the theme state and persist it to `localStorage`.

### Out of Scope

-   Creating more than two themes (light/dark).
-   Theming for user-generated content or custom CSS.
-   Automatic theme switching based on OS preference (this can be a fast-follow).

## 4. Key Questions to Answer

1.  Which semantic tokens in `design-tokens.css` are the most critical for theming? (e.g., `--surface-bg-primary`, `--surface-fg-primary`, `--control-border-primary`).
2.  Are there any hardcoded color values (`#FFF`, `rgba(...)`) in the CSS Modules that need to be replaced with CSS variables?
3.  What is the best persistence strategy? (Answer: `localStorage` is standard and effective).
4.  What is the expected visual appearance of components like selected items, hover states, and focus rings in dark mode?

## 5. Proposed Tasks & Spikes

1.  **Task: Audit and Map Tokens (2 hours)**
    -   Create a simple spreadsheet or document.
    -   List all semantic color/background/border/shadow variables from `design-tokens.css`.
    -   For each variable, define its corresponding dark mode value. For example:
        -   `--surface-bg-primary`: `var(--primitives-base-white)` -> `var(--primitives-grey-900)`
        -   `--surface-fg-primary`: `var(--primitives-grey-900)` -> `var(--primitives-grey-100)`

2.  **Task: Implement Dark Theme CSS (2 hours)**
    -   Create `src/styles/themes.css` and import it in `src/styles/index.css`.
    -   In this file, create a `[data-theme="dark"] { ... }` block.
    -   Populate this block with the dark mode variable overrides defined in the audit task.

3.  **Task: Implement Theme Management Logic (2 hours)**
    -   Create a `themeAtom` in `src/data/atoms.ts` that reads its initial value from `localStorage`.
    -   Create a `useTheme` custom hook in `src/data/` that provides the current theme and a `setTheme` function. This hook should also contain the `useEffect` logic to update `localStorage` and the `data-theme` attribute on the `<body>` element whenever the atom changes.

4.  **Task: Implement UI Toggle (1 hour)**
    -   Add a new "Dark Mode" `MenuOption` to the `HeaderMenu` component.
    -   This option will use the `useTheme` hook to display its checked state and to toggle the theme on click.

5.  **Task: Visual QA and Refinement (3-4 hours)**
    -   Manually go through every screen and component in the application in dark mode.
    -   Identify and fix any visual issues, poor contrast, or hardcoded colors that were missed.
    -   Pay special attention to hover, active, selected, and disabled states.

## 6. Success Criteria

-   A user can switch between light and dark themes using a control in the UI.
-   The chosen theme persists across page reloads.
-   All components are legible, aesthetically pleasing, and fully functional in both themes.
-   No hardcoded colors remain in the codebase; all colors are derived from the themeable CSS variables.