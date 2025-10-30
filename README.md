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

### The Interactive Layer Pattern
To ensure separation of concerns, the canvas renders components through a stack of wrappers. Logic is strictly isolated:
-   **`ComponentRenderer`**: A pure, memoizable component responsible only for visual presentation.
-   **`SelectionWrapper`**: A higher-order component that implements the core canvas interaction logic, including the advanced selection model and display of the `SelectionToolbar`.
-   **`SortableWrapper`**: The outermost layer that integrates with `dnd-kit` to provide drag-and-drop capabilities.

### Advanced Selection Model
The editor uses an industry-standard selection model to feel familiar and powerful.
-   **Single Click:** Selects a single component. This also sets a "selection anchor" for range-selects.
-   **Ctrl/Cmd + Click:** Toggles a single component into or out of the current selection without deselecting others.
-   **Shift + Click:** Selects a contiguous range of components from the last "selection anchor". This is based on the component order in the data tree, not visual position, ensuring predictable behavior. This is constrained to components that share the same parent container.

### Action Discoverability ("Intelligent Disclosure")
-   **Multiple Access Points:** Actions can be triggered via the `SelectionToolbar`, the right-click `CanvasContextMenu`, and keyboard hotkeys.
-   **Single Source of Truth for Logic:** A centralized hook, `useComponentCapabilities`, determines which actions are possible for any given selection. This ensures absolute consistency across all UI surfaces.
-   **Intelligent Disclosure:** The menus follow a refined UX pattern for discoverability:
    -   Actions that are **impossible** for a given component type (e.g., "Unwrap" on a non-container) are **hidden entirely** to reduce clutter.
    -   Actions that are **possible** but temporarily unavailable (e.g., "Move Up" when an item is already at the top) are **shown but disabled**. This teaches the user the full capability of the tool.
-   **Contextual Shortcuts:** The top-level `SelectionToolbar` includes a "smart" slot that shows a high-priority contextual action like **Wrap** or **Unwrap**.

### Global Hotkey System
To ensure a fast and predictable workflow, the application features a comprehensive set of keyboard hotkeys. All global editor hotkeys—including undo/redo, delete, wrap/unwrap, and component nudging—are managed in a single, centralized hook (`src/data/useEditorHotkeys.ts`). This centralization makes the system easy to maintain and prevents conflicts between different parts of the application.

### Drag-and-Drop (DnD) Contracts
-   **Stability Above All:** Layout-shifting animations are disabled during a drag operation to keep drop targets "rock solid".
-   **Centralized Logic:** All DnD event handling (`onDragStart`, `onDragOver`, `onDragEnd`) is encapsulated within the `src/data/useCanvasDnd.ts` hook.

## 5. Styling Architecture

The project uses a **systematic CSS architecture** organized into layers to control specificity and promote a cohesive design language. Please see our **[High-Craft CSS Principles](./CSS-PRINCIPLES.md)** for detailed patterns and conventions.

-   **Design Tokens:** The styling foundation is a three-tiered token system for maximum clarity and flexibility:
    -   `primitives.css`: Contains raw, context-agnostic values (hex codes, spacing units).
    -   `utility.css`: A layer that defines simple, reusable utility tokens, such as alpha transparency scales.
    -   `semantics.css`: Maps primitive or utility values to semantic, purpose-driven variable names (e.g., `--control-bg-hover`).
-   **Data-Attribute Styling:** Components use `data-*` attributes for styling variants (e.g., `<Button data-variant="tertiary" data-size="s">`). This provides superior semantic clarity and simplifies style composition over traditional modifier classes.
-   **Layered Cascade:** The global style cascade is managed in a single location (`src/index.css`) using CSS `@layer`. This provides predictable style application and prevents specificity conflicts between global styles, shared component styles, and scoped CSS Modules.
-   **Robust Primitives:** Core UI patterns that require complex state management and accessibility (dropdowns, context menus, tooltips) are built using **Radix UI**, enhancing stability and craft.

### The Shared Menu System
To enforce the "Single Source of Truth" for our UI, we use the global **`menu.css`** stylesheet to provide a single, unified style definition for all list-based selection components. This system guarantees that primitives from multiple Radix UI packages (`DropdownMenu`, `ContextMenu`, `Select`) and custom components are visually indistinguishable. It relies on a composition of a shared container (`.menu-popover`) and a shared item (`.menu-item`) to ensure perfect alignment, spacing, and state styling across the entire application.

### Focus Ring Convention
-   **Standard Focus Ring:** The default focus indicator for all interactive elements is a `2px` **outer** box-shadow (`box-shadow: 0 0 0 2px var(--control-focus-ring-standard)`).
-   **The "Safe Zone" Contract:** Any container that must use `overflow: hidden` (e.g., an accordion) is required to provide a `2px` internal padding to ensure this outer focus ring is never clipped.
-   **The Menu Item Exception:** Menu items are the only components that use an **inset** focus shadow, a necessary exception to prevent clipping by the popover's rounded corners.

## 6. Key File Manifest

### Core Application (`src/`)
*   **`main.tsx`**: The application's entry point.
*   **`App.tsx`**: The root React component and application shell.
*   **`types.ts`**: Centralized TypeScript type definitions.
*   **`index.css`**: The single source of truth for the CSS cascade layer order.

### Styling (`src/styles/`)
*   **`primitives.css`**: Raw, non-semantic design tokens (colors, spacing).
*   **`utility.css`**: Reusable utility tokens (e.g., alpha transparency).
*   **`semantics.css`**: Semantic design tokens that map to primitives.
*   **`buttons.css`**, **`forms.css`**, **`menu.css`**: Global base styles for common UI patterns.

### Data & State Management (`src/data/`)
*   **`atoms.ts`**: Defines all global **UI state** using Jotai atoms. Includes the core `canvasInteractionAtom` and the `selectionAnchorIdAtom` for range-select.
*   **`historyAtoms.ts`**: The heart of the application. Implements the undo/redo system and manages the core canvas state via a reducer pattern.
*   **`useCanvasDnd.ts`**: A custom hook encapsulating all drag-and-drop logic for the canvas.
*   **`useEditorHotkeys.ts`**: A custom hook that centralizes all global keyboard shortcut logic.
*   **`useUndoRedo.ts`**: A custom hook providing a clean API for undo/redo actions.

### Features (`src/features/`)
*   **`Editor/`**: The main form-building feature.
    *   `EditorCanvas.tsx`: The main container component with core event handlers.
    *   `CanvasNode.tsx`: The recursive engine for rendering the component tree.
    *   `CanvasRenderers.tsx`: Pure presentation logic (The View).
    *   `CanvasWrappers.tsx`: Manages user interaction logic (selection, DnD).
    *   `CanvasContextMenu.tsx`: Renders the right-click context menu via Radix UI.
    *   `useComponentCapabilities.ts`: A hook that centralizes the logic for determining which actions are possible for the current selection.
    *   `PropertiesPanel/`: The right-hand panel for editing component properties.
*   **`ComponentBrowser/`**: The left-hand panel for adding new components.
*   **`AppHeader/`**: The main application header, including the main menu implemented with Radix UI.
*   **`Preview/`**: The "Preview" mode for a clean, editor-free view of the form.

### Reusable Components (`src/components/`)
*   **`Button.tsx`**: The composable, data-attribute-driven button component.
*   **`FormRenderer.tsx`**: A crucial, "pure" component that recursively renders the form state with no editor logic, used in Preview mode.
*   **`Modal.tsx`, `Select.tsx`, `Tooltip.tsx`, etc.**: High-quality, generic UI primitives, many built on Radix UI.