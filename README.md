# Screen Studio: Project Overview & Conventions

This document is the primary entry point for developers. It provides a high-level overview of the project's architecture, file structure, and coding conventions.

---

## Architectural Guidance

To ensure consistency and prevent recurring issues, all developers should be familiar with our core architectural principles. These documents contain critical information about our approach to styling, state management, and component design.

-   **[High-Craft CSS Principles](./CSS-PRINCIPLES.md):** Essential reading to understand our styling philosophy and avoid common layout pitfalls.

---

## 1. Core Architectural Principles

These foundational rules ensure a consistent, high-craft, and maintainable user experience.

-   **Single Source of Truth:** Every piece of data and every visual element must have one, and only one, unambiguous source of truth. State is managed centrally (Jotai), styling is encapsulated or shared globally, and content is separated from presentation.
-   **Intrinsic Sizing and Natural Flow:** Components and layouts are intrinsically sized by default. We avoid fixed heights in favor of `min-height` and modern CSS (Flexbox, Grid) to allow content to flow naturally. The canvas feels like a fluid, living document.
-   **State-Driven Appearance:** The UI reflects the application's state by changing the appearance of existing elements (via `data-*` attributes), not by swapping out chunks of the DOM. This ensures UI stability and eliminates jarring visual jumps.
-   **High-Craft Transitions & Details:** All state changes are communicated through smooth, purposeful transitions on performant CSS properties (`transform`, `opacity`, etc.). Visual details, like ensuring icon optical size (`opsz`) matches font size, are treated as first-class requirements.

## 2. Directory Structure & Import Guidelines

This project uses a **feature-based architecture**. The goal is to group files by their application feature (e.g., `Editor`, `Settings`) to improve colocation and maintainability.

-   **/src**: Contains the application entry point (`main.tsx`), root container (`App.tsx`), global utility stylesheets, and global type definitions.
-   **/src/features**: Contains the major, user-facing areas of the application. Each sub-directory is a "vertical slice" of functionality.
-   **/src/components**: Contains only **truly generic and reusable** UI primitives that are application-agnostic.
-   **/src/data**: A consolidated directory for all non-visual logic and definitions (Jotai atoms, custom hooks, etc.).

**Import Rule:** Always use relative paths (`./`, `../`). This project does not use TypeScript path aliases.

## 3. State Management Architecture

The project uses **Jotai** for its minimal, atomic state management model. State is divided into two tiers:

1.  **UI State (`src/data/atoms.ts`):** Manages the "control panel" of the UI—panel visibility, active tabs, modal states, and the current interaction mode of the canvas (idle, selecting, editing).
2.  **Core Application State (`src/data/historyAtoms.ts`):** The most critical state file. It manages the actual structure of the form being built and implements the entire undo/redo system using a **reducer pattern**.

### The Golden Rule: `commitActionAtom`

To modify the canvas state, you **must** use the `commitActionAtom`. This is a write-only atom that acts as the central dispatcher for all mutations, ensuring every change is predictable, testable, and automatically recorded in the undo/redo history.

### Reliable Undo/Redo with State Restoration

The undo/redo system is architected for a professional user experience. Beyond just reverting the state of the canvas components, it also saves and restores the **complete interaction state** (including the user's current selection) with every action. This ensures that undoing an action feels like a true reversal of the last step, perfectly restoring the user's context without losing their selection.

## 4. Canvas & Interaction Architecture

The canvas is built on a contract of stability, clarity, and intuitive interaction.

### The Unified Rendering Pattern
To guarantee visual consistency and eliminate code duplication, all canvas components are rendered through a single, unified set of renderer components located in `src/features/Editor/renderers/`.
-   **The `mode` Prop Contract:** Each renderer (e.g., `TextInputRenderer.tsx`) accepts a `mode: 'canvas' | 'preview'` prop. This is the single source of truth for its visual output.
    -   `mode="preview"`: The renderer returns a pure, memoized presentational component. This path is used for the final output in `Preview` mode and for the `dnd-kit` drag overlay.
    -   `mode="canvas"`: The renderer uses the `useEditorInteractions` hook to wrap the presentational component with all necessary logic for selection, sorting (DnD), and inline editing.
-   **Centralized Interaction Logic:** The `useEditorInteractions` hook is a single, reusable hook that encapsulates all the logic for making a component interactive on the canvas, including `dnd-kit` integration and the advanced selection model.

### Advanced Selection Model
The editor uses an industry-standard selection model to feel familiar and powerful.
-   **Single Click:** Selects a single component.
-   **Ctrl/Cmd + Click:** Toggles a single component into or out of the current selection.
-   **Shift + Click:** Selects a contiguous range of components from the last "selection anchor".
-   **Alt/Option + Click or Double-Click:** Directly enters inline editing mode for supported components (Text Inputs, Paragraphs, Headings, etc.).
-   **Right-Click (Context Menu):** Right-clicking an unselected component will select it. Right-clicking an already selected component will preserve the current selection.

### Action Discoverability ("Intelligent Disclosure")
-   **Multiple Access Points:** Actions can be triggered via the generic `ActionToolbar` system (for single and multi-select), the right-click `CanvasContextMenu`, and keyboard hotkeys.
-   **Single Source of Truth for Logic:** Logic is now split into two dedicated hooks for ultimate clarity:
    -   `useComponentCapabilities`: Determines *which* actions are possible for any given selection (e.g., can this item be unwrapped?).
    -   `useCanvasActions`: Provides the memoized *implementation* for all canvas actions (e.g., `handleWrap`, `handleDelete`), centralizing all calls to `commitActionAtom`.
-   **Intelligent Disclosure:** The menus follow a refined UX pattern for discoverability:
    -   Actions that are **impossible** for a given component type are **hidden entirely**.
    -   Actions that are **possible** but temporarily unavailable are **shown but disabled**.

### Global Hotkey System
All global editor hotkeys are managed in a single, centralized hook (`src/data/useEditorHotkeys.ts`). This centralization makes the system easy to maintain and prevents conflicts.

### Drag-and-Drop (DnD) Contracts
-   **Stability Above All:** Layout-shifting animations are disabled during a drag operation to keep drop targets "rock solid".
-   **Centralized Logic:** All DnD event handling is encapsulated within the `src/data/useCanvasDnd.ts` hook.

### View-Aware Logic
To ensure a clean separation of concerns, all editor-specific systems must be "view-aware." This means they must check the current application view mode (via the `appViewModeAtom`) and disable their functionality when the user is not in the `'editor'`. This is the primary mechanism that prevents editor interactions (like keyboard hotkeys and mouse selection) from being active in read-only modes like "Preview."

## 5. Styling Architecture

The project uses a **systematic CSS architecture** organized into layers to control specificity and promote a cohesive design language. Please see our **[High-Craft CSS Principles](./CSS-PRINCIPLES.md)** for detailed patterns and conventions.

-   **Design Tokens:** A three-tiered token system (`primitives.css`, `utility.css`, `semantics.css`).
-   **Data-Attribute Styling:** Components use `data-*` attributes for styling variants.
-   **Layered Cascade:** The global style cascade is managed in `src/index.css` using CSS `@layer`.
-   **Robust Primitives:** Core UI patterns are built using **Radix UI** for stability and craft.

### The Shared Menu System
We use a global **`menu.css`** stylesheet to provide a single, unified style definition for all list-based selection components (`DropdownMenu`, `ContextMenu`, `Select`), ensuring perfect visual consistency.

### Focus Ring Convention
-   **Standard Focus Ring:** A `2px` **outer** box-shadow.
-   **The "Safe Zone" Contract:** Any container with `overflow: hidden` must provide `2px` of internal padding to prevent clipping the focus ring of its children.
-   **The Menu Item Exception:** Menu items use an **inset** focus shadow.

## 6. Key File Manifest

### Core Application (`src/`)
*   **`main.tsx`**: The application's entry point.
*   **`App.tsx`**: The root React component and application shell.
*   **`types.ts`**: Centralized TypeScript type definitions.
*   **`index.css`**: The single source of truth for the CSS cascade layer order.

### Styling (`src/styles/`)
*   **`primitives.css`**, **`utility.css`**, **`semantics.css`**: Design token system.
*   **`buttons.css`**, **`forms.css`**, **`menu.css`**: Global base styles for common UI patterns.

### Data & State Management (`src/data/`)
*   **`atoms.ts`**: Defines all global **UI state** using Jotai atoms.
*   **`historyAtoms.ts`**: Implements the undo/redo system and manages the core canvas state.
*   **`useCanvasDnd.ts`**: Encapsulates all drag-and-drop logic for the canvas.
*   **`useEditorHotkeys.ts`**: Centralizes all global keyboard shortcut logic.
*   **`useUndoRedo.ts`**: Provides a clean API for undo/redo actions.

### Features (`src/features/`)
*   **`Editor/`**: The main form-building feature.
    *   `EditorCanvas.tsx`: The main container component with core event handlers.
    *   `CanvasNode.tsx`: The recursive engine that routes to the correct unified renderer.
    *   `renderers/`: **[NEW]** A directory containing the single source of truth for component rendering.
    *   `useEditorInteractions.ts`: **[NEW]** A hook that encapsulates all canvas interaction logic.
    *   `useCanvasActions.ts`: **[NEW]** A hook that centralizes the implementation of all canvas mutation actions.
    *   `useComponentCapabilities.ts`: A hook that centralizes the logic for determining which actions are possible.
    *   `CanvasSelectionToolbar.tsx`: The specific implementation of the single-selection toolbar.
    *   `CanvasContextMenu.tsx`: Renders the right-click context menu.
    *   `PropertiesPanel/`: The right-hand panel for editing component properties.
*   **`ComponentBrowser/`**: The left-hand panel for adding new components.
*   **`AppHeader/`**: The main application header.
*   **`Preview/`**: The "Preview" mode for a clean, editor-free view of the form.

### Reusable Components (`src/components/`)
*   `ActionToolbar.tsx`: A generic, positioning-aware toolbar container.
*   `ActionMenu.tsx`: A generic, data-driven menu component.
*   **`Button.tsx`**: The composable, data-attribute-driven button component.
*   **`Modal.tsx`, `Select.tsx`, `Tooltip.tsx`, etc.**: High-quality, generic UI primitives.