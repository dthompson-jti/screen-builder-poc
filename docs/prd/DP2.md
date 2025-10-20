# discovery-plan-styles-refactor.md

## 1. Introduction

This document outlines the plan to improve the project's file structure by reorganizing all global CSS files from the `src/` root directory into a dedicated `src/styles/` directory. This will declutter the application's root, clarify the architectural boundary between styling and application logic, and improve overall maintainability.

## 2. Goals

-   Create a single, unambiguous location for all global stylesheets.
-   Clean up the `src/` directory, leaving only core application entry points and type definitions.
-   Ensure the refactor does not cause any visual regressions in the application.

## 3. Scope

### In Scope

-   Creating the `src/styles/` directory.
-   Moving all `.css` files (except CSS Modules) from `src/` to `src/styles/`.
-   Moving `src/views/appearance.css` to `src/styles/appearance.css`.
-   Updating the `@import` statements within `src/styles/index.css` to reflect the new file locations.

### Out of Scope

-   Refactoring any CSS code within the files. This is a file-moving task only.
-   Converting any existing global CSS files to CSS Modules.

## 4. Key Questions to Answer

1.  Is the CSS `@layer` order defined in `index.css` dependent on the file paths, or just the order of the `@import` statements? (Hypothesis: It depends only on the import order, making this a safe change).
2.  Are there any JavaScript files that are directly importing these global CSS files, which would also need to be updated? (Initial analysis suggests all imports are consolidated within `index.css` and `main.tsx`, but this must be verified).
3.  Are there any other "stray" style-related files that should be moved at the same time?

## 5. Proposed Tasks

1.  **Task: Create Directory and Move Files (0.5 hours)**
    -   Create the `src/styles/` directory.
    -   Move the following files from `src/` to `src/styles/`:
        -   `animations.css`
        -   `appearance.css` (from `src/views/` or `src/`)
        -   `buttons.css`
        -   `design-tokens.css`
        -   `forms.css`
        -   `index.css`
        -   `menu.css`
        -   `navigator.css`
        -   `scrollbars.css`
        -   `tabs.css`

2.  **Task: Update Import Paths (0.5 hours)**
    -   In `src/styles/index.css`, update all `@import` paths to be relative (e.g., `@import './design-tokens.css';`).
    -   In `src/main.tsx`, update the `import './index.css'` to `import './styles/index.css'`.

3.  **Task: Verification (1 hour)**
    -   Run the development server (`npm run dev`).
    -   Perform a full visual regression check of the application, paying close attention to:
        -   Component styling (buttons, inputs, tabs).
        -   Layouts and spacing.
        -   The behavior of the `NodeNavigator`.
        -   Scrollbar appearance.

## 6. Success Criteria

-   The `src/` directory no longer contains any global `.css` files.
-   The `src/styles/` directory contains all global stylesheets.
-   The application compiles and runs without errors.
-   There are zero visual or functional regressions related to styling after the file move.