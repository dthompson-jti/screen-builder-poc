# Project Structure & Coding Conventions

This document outlines the specific structural and coding conventions for the `form-editor-poc` project. Adhering to these guidelines is crucial for preventing common issues related to module resolution and for maintaining a clean, scalable codebase.

## 1. Directory Structure Philosophy

This project uses a refined, flatter-than-usual directory structure within `/src`. The goal is to logically group files by their function (view, component, data/logic) while minimizing nesting depth.

-   **/src**: Contains the application entry point (`main.tsx`), root container (`App.tsx`), global utility stylesheets, and global type definitions.
-   **/src/views**: Contains major, high-level components that define primary screen layouts or application areas (e.g., `EditorCanvas`, `PropertiesPanel`).
-   **/src/components**: Contains smaller, granular, and highly reusable UI primitives (e.g., `Modal`, `PanelHeader`, `TextInputPreview`).
-   **/src/data**: A consolidated directory for all non-visual logic and definitions. This includes global state (Jotai atoms), custom hooks, mock data, and other business logic.

## 2. Component File Location

The distinction between `/views` and `/components` is crucial for maintaining organization.

-   **View Components (`/src/views`):** These are the primary building blocks of the application's layout. They are often stateful and compose multiple smaller components to create a feature or a major panel.
    -   *Examples: `EditorCanvas.tsx`, `PropertiesPanel.tsx`, `SettingsPage.tsx`, `AppHeader.tsx`*

-   **UI Primitives (`/src/components`):** These are small, often presentational components that are used across multiple views. They should be as generic and reusable as possible.
    -   *Examples: `PanelHeader.tsx`, `Modal.tsx`, `DataBindingPicker.tsx`*

## 3. Import Path Guidelines

**Rule #1: Always use relative paths.** This project does not use TypeScript path aliases (e.g., `@/components`). All imports must be relative (`./`, `../`).

**Rule #2: Verify paths based on the current file's location.**

#### Case A: Importing from a file directly in `/src` (e.g., from `src/App.tsx`)

To import from sibling directories like `/views`, `/data`, or `/components`, use the `./` prefix.

```typescript
// Example from src/App.tsx

// Correct:
import { AppHeader } from './views/AppHeader';
import { ResizablePanel } from './components/ResizablePanel';
import { useCanvasDnd } from './data/useCanvasDnd';
import { appViewModeAtom } from './data/atoms';
```

#### Case B: Importing from a file within a subdirectory (e.g., from `src/views/PropertiesPanel.tsx`)

To import from another top-level directory like `/data` or `/components`, you must use the `../` prefix to go "up" to `/src` first.

```typescript
// Example from src/views/PropertiesPanel.tsx

// Correct:
import { canvasComponentsAtom } from '../data/atoms';
import { DataBindingPicker } from '../components/DataBindingPicker';
import { FormComponent } from '../types'; // Goes up to /src to find types.ts
```

## 4. Styling Conventions

This project employs a **hybrid CSS architecture** that combines the strengths of global utility stylesheets with the safety of locally-scoped component styles via **CSS Modules**.

### 4.1. File Naming and Location

-   **Component-Specific Styles:** Must be co-located with their corresponding `.tsx` component file and named with the `*.module.css` extension (e.g., `Button.tsx` and `Button.module.css`).
-   **Global Utility Styles:** A small, curated set of stylesheets that apply globally. These are located in the `/src` directory and use the standard `*.css` extension.

### 4.2. Global Stylesheets

The following files are intentionally global and are imported **only once** in `src/index.css`. **Do not import these anywhere else.**

-   `src/buttons.css`: Global styles for `.btn`, `.btn-primary`, etc.
-   `src/forms.css`: Base styles for `input`, `select`, `textarea`, `checkbox`.
-   `src/menu.css`: Global styles for popover menu items (`.menu-item`).
-   `src/tabs.css`: Styles for tab components (`.tab-group`, `.tab-button`).
-   `src/design-tokens.css`: The foundational design token library.
-   `src/navigator.css`: A special case for the non-React `navigator.js` component, manually scoped with the `.node-navigator` class.

### 4.3. Using CSS Modules

-   **Importing:** Import the module into your component file: `import styles from './MyComponent.module.css';`
-   **Applying Classes:** Use the imported `styles` object to apply class names. This guarantees that styles are scoped and will not conflict with other components.

    ```typescript
    // Correct usage within a component
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome</h1>
      </div>
    );
    ```

-   **Combining Classes:** To combine a module class with a global class or a conditional class, use template literals.

    ```typescript
    const isActive = true;
    const buttonClasses = `btn btn-primary ${isActive ? styles.active : ''}`;

    return <button className={buttonClasses}>Click Me</button>;
    ```

### 4.4. TypeScript Integration

To provide TypeScript with type information for `.module.css` files, a declaration file is required.

-   **File:** `src/vite-env.d.ts`
-   **Content:** This file must contain the following module declaration:
    ```typescript
    declare module '*.module.css' {
      const classes: { readonly [key: string]: string };
      export default classes;
    }
    ```

## 5. TypeScript Configuration

The project uses a solution-style `tsconfig.json` at the root.

-   The primary configuration for the application source code is `tsconfig.app.json`.
-   Crucially, `tsconfig.app.json` must **NOT** extend the root `tsconfig.json`, as this creates a circular dependency that can break the VS Code language server's module resolution.
