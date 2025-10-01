
# Project Structure & Coding Conventions

This document outlines the specific structural and coding conventions for the `form-editor-poc` project. Adhering to these guidelines is crucial for preventing common issues related to module resolution and for maintaining a clean, consistent codebase.

## 1. Directory Structure Philosophy

This project intentionally uses a **flatter-than-usual** directory structure within `/src`. The goal is to reduce nesting depth and keep related top-level features easily accessible.

-   `/src`: Contains primary application files, entry points, and some top-level component files.
-   `/src/components`: Contains more granular, reusable, or child components.
-   `/src/data`: Contains all mock data and static data sources.
-   `/src/state`: Contains all global state management files (Jotai atoms).

## 2. Component File Location

The location of a component file is the **single most important factor** for determining its import paths.

-   **Top-Level Components:** Major view components or containers (like `App.tsx`, `GeneralComponentsBrowser.tsx`) may reside directly inside `/src`.
-   **Reusable/Child Components:** Smaller, reusable components (like `PanelHeader.tsx`, `TextInputPreview.tsx`) should be placed inside `/src/components`.

## 3. Import Path Guidelines

**Rule #1: Always use relative paths.** This project does not use TypeScript path aliases (e.g., `@/components`). All imports must be relative (`./`, `../`).

**Rule #2: Verify paths based on the current file's location.**

#### Case A: Importing from a file directly in `/src` (e.g., from `src/App.tsx`)

To import from sibling directories like `/state`, `/data`, or `/components`, use the `./` prefix.

```typescript
// Example from src/GeneralComponentsBrowser.tsx

// Correct:
import { isComponentBrowserVisibleAtom } from './state/atoms';
import { generalComponents } from './data/generalComponentsMock';
import { PanelHeader } from './components/PanelHeader';
```

#### Case B: Importing from a file within a subdirectory (e.g., from `src/components/PropertiesPanel.tsx`)

To import from a parent-level directory like `/state`, you must use the `../` prefix to go "up" one level.

```typescript
// Example from src/components/PropertiesPanel.tsx

// Correct:
import { canvasComponentsAtom } from '../state/atoms';
import { FormComponent } from '../types'; // Goes up to /src to find types.ts
```

## 4. TypeScript Configuration

The project uses a solution-style `tsconfig.json` at the root.

-   The primary configuration for the application source code is `tsconfig.app.json`.
-   **Crucially, `tsconfig.app.json` must NOT extend the root `tsconfig.json`**, as this creates a circular dependency that breaks the VS Code language server's module resolution.

## 5. Troubleshooting "Cannot find module" Errors

If you encounter a `ts(2307): Cannot find module` error, follow these steps before attempting any other debugging:

1.  **Verify the current file's location** in the directory tree.
2.  **Manually trace the relative path** from your file to the module you are trying to import.
3.  **Correct the path** using `./` or `../` as needed.
4.  If the error persists after correcting the path, restart the VS Code TS Server by opening the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and running **`TypeScript: Restart TS Server`**.