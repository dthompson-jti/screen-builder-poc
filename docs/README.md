### README.md
```markdown
# Screen Studio: Project Overview & Conventions

This document is the primary entry point for developers. It provides a high-level overview of the project's architecture, file structure, and coding conventions.

## 1. Directory Structure Philosophy (Post-Refactor)

This project uses a **feature-based architecture**. The goal is to group files by their application feature (e.g., `Editor`, `Settings`) to improve colocation and maintainability.

-   **/src**: Contains the application entry point (`main.tsx`), root container (`App.tsx`), global utility stylesheets, and global type definitions.
-   **/src/features**: Contains the major, user-facing areas of the application. Each sub-directory is a "vertical slice" of functionality, containing its own components, logic, and styles.
    -   *Examples: `/features/Editor`, `/features/AppHeader`, `/features/Settings`*
-   **/src/components**: Contains only **truly generic and reusable** UI primitives that are application-agnostic.
    -   *Examples: `Modal.tsx`, `Tooltip.tsx`, `ResizablePanel.tsx`*
-   **/src/data**: A consolidated directory for all non-visual logic and definitions. This includes global state (Jotai atoms), custom hooks, mock data, and other business logic.

## 2. Import Path Guidelines

**Rule #1: Always use relative paths.** This project does not use TypeScript path aliases (e.g., `@/components`). All imports must be relative (`./`, `../`).

**Rule #2: Verify paths based on the current file's location.**

#### Case A: Importing from a file directly in `/src` (e.g., from `src/App.tsx`)

To import from sibling directories like `/features`, `/data`, or `/components`, use the `./` prefix.

```typescript
// Example from src/App.tsx
import { AppHeader } from './features/AppHeader/AppHeader';
import { ResizablePanel } from './components/ResizablePanel';
import { useCanvasDnd } from './data/useCanvasDnd';
```

#### Case B: Importing from a file within a feature (e.g., from `src/features/Editor/PropertiesPanel/PropertiesPanel.tsx`)

To import from another top-level directory like `/data` or `/components`, you must use the `../` prefix to go "up" to `/src` first. The number of `../` depends on the file's depth.

```typescript
// Example from src/features/Editor/PropertiesPanel/PropertiesPanel.tsx
// Path: ../ (to Editor) -> ../ (to features) -> ../ (to src) -> ./components
import { Select } from '../../../components/Select';
import { FormComponent } from '../../../types';
```

## 3. File Manifest: Key Files and Responsibilities

### Core Application (`src/`)
*   **`main.tsx`**: The application's entry point. Renders the root `App` component and provides the Jotai state management context.
*   **`App.tsx`**: The root React component and application shell. It orchestrates the main layout, hosts the `DndContext`, and conditionally renders the primary features (`Editor`, `Preview`, `Settings`).
*   **`types.ts`**: Centralized TypeScript type definitions for all major data structures (`CanvasComponent`, `DndData`, etc.).

### Data & State Management (`src/data/`)
*   **`atoms.ts`**: Defines all global **UI state** using Jotai atoms (panel visibility, active tabs, modal states, etc.).
*   **`historyAtoms.ts`**: The heart of the application. Implements the undo/redo system and manages the core state of the form being built and implements the entire undo/redo system using a **reducer pattern**.
*   **`useCanvasDnd.ts`**: A custom hook encapsulating all drag-and-drop logic for the canvas.
*   **`useEditorHotkeys.ts`**: A custom hook that centralizes all global keyboard shortcut logic for the editor canvas (e.g., delete, wrap, reorder).
*   **`useUndoRedo.ts`**: A custom hook providing a clean API for undo/redo actions with toast notifications.
*   **`*Mock.ts` files**: Provide static data for the proof of concept.

### Features (`src/features/`)
*   **`Editor/`**: The main form-building feature.
    *   **Architecture (Flattened Canvas):** This directory now contains the canvas engine, wrappers, renderers, and supporting UI artifacts, following the Interactive Layer Pattern:
        *   **`EditorCanvas.tsx`**: The main container component.
        *   **`CanvasNode.tsx`**: The recursive engine for rendering the component tree.
        *   **`CanvasRenderers.tsx`**: Pure presentation logic (The View).
        *   **`CanvasWrappers.tsx`**: Interaction logic (Selection, DnD, Sortable context).
        *   **`canvasUtils.ts`**: Pure utility functions (e.g., `getComponentName`).
    *   **`PropertiesPanel/`**: The right-hand panel for editing the properties of the selected component.
    *   **`previews/`**: Contains all the visual previews of components used for the drag overlay.
    *   **`MainToolbar.tsx`**: The primary vertical toolbar on the left of the editor.
*   **`ComponentBrowser/`**: The left-hand panel for finding and adding new components to the canvas.
*   **`DataNavigator/`**: The powerful navigator widget used within the `ComponentBrowser` and `DataBindingModal`.
*   **`AppHeader/`**: The main application header, including the form name editor and view mode tabs.
*   **`Settings/`**: The main "Settings" view.
*   **`Preview/`**: The "Preview" mode, which uses `FormRenderer` for a clean, editor-free view of the form.

### Reusable Components (`src/components/`)
*   **`FormRenderer.tsx`**: A crucial, "pure" component that recursively renders the form state. It contains **no editor logic** and is used by `PreviewView` for a pixel-perfect final output.
*   **`Modal.tsx`, `Select.tsx`, `Tooltip.tsx`, etc.**: High-quality, generic UI primitives used across multiple features.

## 4. TypeScript & Styling

*   **`vite-env.d.ts`**: Provides TypeScript with type information for `.module.css` files, which is essential for type safety when using CSS Modules.
*   **`tsconfig.app.json`**: The primary TypeScript configuration for the application source code.
*   **Styling:** The project uses a hybrid approach. See the **[ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md)** for a full explanation of the styling layers.