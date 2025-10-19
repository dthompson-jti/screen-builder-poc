# Project Overview & File Manifest

This document provides a high-level overview of the `form-editor-poc` codebase, explaining the purpose and responsibility of key files and directories. For a new developer, this is the best place to start to understand the project's architecture.

### **Project Configuration**

These files at the root level control the project's build process, dependencies, and code quality rules.

*   **`package.json`**
    *   **Purpose:** Defines project metadata, scripts, and dependencies.
    *   **Key Info:** The `scripts` section (`dev`, `build`, `lint`) contains the primary commands for development. The `dependencies` and `devDependencies` lists provide a complete inventory of external libraries used.
*   **`vite.config.ts`**
    *   **Purpose:** Configures the Vite build tool.
    *   **Key Info:** Sets up the React plugin (`@vitejs/plugin-react`). Contains the `base` path configuration, which is critical for GitHub Pages deployment.
*   **`tsconfig.app.json` / `tsconfig.node.json`**
    *   **Purpose:** TypeScript configuration files. `app.json` is for the main application source code (`/src`), while `node.json` is for Node.js-based configuration files like `vite.config.ts`.
    *   **Key Info:** Enforces strict type checking and modern JS/TS features. Configures JSX for React 19.
*   **`eslint.config.js`**
    *   **Purpose:** Configures the ESLint static analysis tool for code quality and consistency.
    *   **Key Info:** Enables type-aware linting by connecting ESLint to the project's TypeScript configuration, which is essential for catching complex bugs.

### **Core Application Structure (`src/`)**

These files form the foundation and entry point of the React application.

*   **`main.tsx`**
    *   **Purpose:** The application's entry point.
    *   **Key Info:** Renders the root `App` component into the DOM. Wraps the application in Jotai's `<Provider>` to enable global state management for all child components.
*   **`App.tsx`**
    *   **Purpose:** The root React component; the main application shell.
    *   **Key Info:**
        *   Orchestrates the overall UI layout, including the `AppHeader` and the main content area.
        *   Conditionally renders the primary views (`EditorCanvas`, `PreviewView`, `SettingsPage`) based on the global `appViewModeAtom`.
        *   Hosts the top-level `DndContext` from `@dnd-kit`, which powers all drag-and-drop functionality.
        *   Contains the global keyboard listener for undo/redo.
*   **`index.html`**
    *   **Purpose:** The main HTML page that hosts the React application.
    *   **Key Info:** Links to external fonts (Google Fonts, Material Symbols) and provides the `<div id="root"></div>` where the application is mounted.
*   **`types.ts`**
    *   **Purpose:** A centralized file for all major TypeScript type definitions used across the application.
    *   **Key Info:** Defining types like `CanvasComponent`, `LayoutComponent`, `DndData`, etc., here ensures consistency and a single source of truth for data structures.

### **Global Styling (`src/`)**

This project uses a hybrid styling architecture. See the **[Styling Architecture Guide](./STYLING_ARCHITECTURE.md)** for a full explanation.

*   **`index.css`**
    *   **Purpose:** The root stylesheet. It sets up CSS layers and imports all other global utility stylesheets.
    *   **Key Info:** This is the **only** place where global styles like `buttons.css` or `forms.css` should be imported. It also defines base `body` styles and a global `data-attribute` for toggling faint button borders.
*   **`design-tokens.css`**
    *   **Purpose:** The foundational design system. Defines all color, spacing, and shadow variables (`--surface-bg-primary`, `--spacing-4`, etc.).
*   **`buttons.css`, `forms.css`, `menu.css`, `tabs.css`, `appearance.css`, `scrollbars.css`**
    *   **Purpose:** Global, utility-first stylesheets that define the look and feel of common, un-scoped elements. They are organized by function and layered in `index.css`.
*   **`*.module.css` files (co-located with components)**
    *   **Purpose:** Locally-scoped CSS files for individual components.
    *   **Key Info:** Using CSS Modules (`import styles from './Component.module.css'`) prevents style collisions and is the standard for component-specific styling in this project.

### **Data & State Management (`src/data/`)**

This directory contains all the application's logic, state, and data definitions. See the **[State Management Guide](./STATE_MANAGEMENT.md)** for a detailed explanation.

*   **`atoms.ts`**
    *   **Purpose:** Defines all global UI state using Jotai atoms.
    *   **Key Info:** This file manages UI state (e.g., panel visibility), view preferences, modal states, and component browser state. It is the "control panel" for the application's UI.
*   **`historyAtoms.ts`**
    *   **Purpose:** The heart of the application's core logic. Implements the undo/redo functionality using a reducer pattern on top of Jotai.
    *   **Key Info:**
        *   Defines the `UndoableState` shape, which is a snapshot of the entire canvas.
        *   Defines all possible mutations (`HistoryAction`) that can be performed on the canvas.
        *   Exports `commitActionAtom`, the single, safe function used to dispatch changes to the canvas state. This is the **primary way to modify the form.**
*   **`useCanvasDnd.ts`**
    *   **Purpose:** A custom hook that encapsulates all logic for canvas drag-and-drop operations.
    *   **Key Info:** Manages the complex state of a drag operation (start, over, end) and translates user actions into `commitActionAtom` dispatches for adding or moving components.
*   **`useUndoRedo.ts`**
    *   **Purpose:** A simple custom hook that provides a clean API for performing undo/redo actions, including showing toast notifications.
*   **`useUrlSync.ts`**
    *   **Purpose:** A custom hook to synchronize application state (like the current view or preview width) with the browser's URL query parameters. This enables shareable links.
*   **`useIsMac.ts`**: A simple utility hook to determine if the user is on a Mac, used for displaying OS-aware keyboard shortcuts (⌘ vs. Ctrl).
*   **`toastAtoms.ts`**
    *   **Purpose:** Defines the state and logic for the application's toast notification system.
*   **`*Mock.ts` files**
    *   **Purpose:** Provide static data for the proof of concept (e.g., `componentBrowserMock.ts`, `settingsMock.ts`).
*   **`navigator.js` & `navigator.d.ts`**
    *   **Purpose:** A vanilla JavaScript class that handles the complex, high-fidelity animation of the Node Navigator widget. `navigator.d.ts` provides TypeScript types for this plain JS file, allowing it to be safely used in the TSX codebase.

### **React Views (`src/views/`)**

These are large, feature-level components that compose the main areas of the application.

*   **`EditorCanvas.tsx`**
    *   **Purpose:** Renders the main form-building area, including the canvas, components, selection outlines, and drop indicators.
    *   **Key Info:** Contains the recursive `CanvasNode` component that renders the form tree. Implements the `useSortable` and `useDroppable` hooks from `dnd-kit` to make the canvas interactive.
*   **`PropertiesPanel.tsx`**
    *   **Purpose:** Renders the right-hand panel, which displays the properties of the currently selected component(s).
    *   **Key Info:** Conditionally renders different UI controls based on the selected component's type (`LayoutProperties` vs. `FormItemProperties`).
*   **`ComponentBrowser.tsx` & `DataNavigatorView.tsx`**
    *   **Purpose:** Manages the left-hand panel for finding and adding new components. `DataNavigatorView` is the core engine that handles the navigator widget, search, and breadcrumbs, while `ComponentBrowser` configures it for dragging data fields.
*   **`AppHeader.tsx`**
    *   **Purpose:** Renders the main application header, including the title, form name editor, view mode tabs (Edit, Preview, Settings), and action buttons.
*   **`SettingsPage.tsx`**
    *   **Purpose:** Renders the main "Settings" view, which includes a navigator and a form for application-level settings.
*   **`PreviewView.tsx`**
    *   **Purpose:** Renders the "Preview" mode, providing a clean, WYSIWYG view of the form without any editor UI. It uses the `FormRenderer` component.

### **Reusable React Components (`src/components/`)**

These are smaller, often presentational components used across multiple views.

*   **`FormRenderer.tsx`**
    *   **Purpose:** A crucial, "pure" component that recursively renders the form based on the state in `historyAtoms`.
    *   **Key Info:** It contains **no editor logic** (no dnd, no selection). It is used by `PreviewView` to provide a pixel-perfect representation of the final output.
*   **`Modal.tsx` & `DataBindingModal.tsx`**
    *   **Purpose:** `Modal.tsx` is a generic modal primitive. `DataBindingModal.tsx` uses it to implement the specific UI for linking a component to a data field.
*   **`SearchInput.tsx`, `Select.tsx`, `Tooltip.tsx`**
    *   **Purpose:** High-quality, reusable form control and UI primitives built on top of libraries like Radix UI.
*   **`ResizablePanel.tsx`**
    *   **Purpose:** Implements the draggable vertical panels used for the component browser and properties panel.
*   **`SelectionToolbar.tsx`**
    *   **Purpose:** The floating toolbar that appears when a component is selected on the canvas, providing actions like delete, settings, and wrap.
*   **`InlineTextInput.tsx`**: A specialized input component that appears in place of a label during an edit. It uses the `useEditable` hook to manage its state.
*   **`SelectionToolbarMenu.tsx`**: The popover menu that appears from the `SelectionToolbar`, displaying a full list of actions and their keyboard shortcuts.