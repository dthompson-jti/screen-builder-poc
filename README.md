# Screen Studio: Project Overview & Conventions

This document is the primary entry point for developers. It provides a high-level overview of the project's architecture, file structure, and coding conventions.

## 1. Core Architectural Principles

These foundational rules ensure a consistent, high-craft, and maintainable user experience.

-   **Single Source of Truth:** Every piece of data and every visual element must have one, and only one, unambiguous source of truth. State is managed centrally (Jotai), styling is encapsulated within components, and content is separated from presentation.
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

The project uses a **systematic CSS architecture** organized into layers to control specificity and promote a cohesive design language.

-   **Design Tokens:** The styling foundation is a three-tiered token system for maximum clarity and flexibility:
    -   `primitives.css`: Contains raw, context-agnostic values (hex codes, spacing units).
    -   `utility.css`: A new layer that defines simple, reusable utility tokens, such as alpha transparency scales (`--utility-alpha-white-20`), which are then referenced by the semantic layer.
    -   `semantics.css`: Maps primitive or utility values to semantic, purpose-driven variable names (e.g., `--control-bg-hover`).
-   **Data-Attribute Styling:** Components use `data-*` attributes for styling variants (e.g., `<Button data-variant="tertiary" data-size="s">`). This provides superior semantic clarity and simplifies style composition over traditional modifier classes.
-   **Layered Cascade:** The global style cascade is managed in a single location (`src/index.css`) using CSS `@layer`. This provides predictable style application and prevents specificity conflicts between global styles, shared component styles, and scoped CSS Modules.
-   **Robust Primitives:** Core UI patterns that require complex state management and accessibility (dropdowns, context menus, tooltips) are built using **Radix UI**, enhancing stability and craft.

### Component System & Shared Styles
To enforce the "Single Source of Truth" principle for our UI, we use shared, global stylesheets for common component patterns. A prime example is **`menu.css`**, which provides a single, unified style definition for all list-based selection components. This system guarantees that primitives from multiple Radix UI packages (`DropdownMenu`, `ContextMenu`, `Select`) are visually indistinguishable. It is built on two key patterns:
1.  **Shared Container:** All menu popovers use the `.menu-popover` class, which defines the container's shape, shadow, and padding.
2.  **Shared Item Structure:** All menu items use the `.menu-item` class, which leverages a consistent internal flexbox layout with defined "slots" for icons, labels, and shortcuts. This guarantees perfect alignment and styling, even when items have different content.
3.  **Shared State Styling:** The stylesheet targets Radix's `data-*` attributes (`[data-highlighted]`, `[data-state="checked"]`, `[data-disabled]`) and standard pseudo-classes (`:hover`) to provide a consistent look and feel for all interaction states across the entire application.

### Border Convention
-   **Standard Border:** The default border thickness for static and interactive elements is `1px`.
-   **Hover/Focus Border (Layout Shift Prevention):** For components that gain a border on hover (like buttons or menu items), we use a high-craft technique to prevent layout shift. The component has a `1px solid transparent` border in its resting state. On hover, the `border-color` is changed, and an additional `inset 0 -1px 0 0 var(...)` box-shadow is applied. This combination creates the visual effect of a `1px` top/left/right border and a `2px` bottom border without altering the element's box model, resulting in a perfectly stable interaction.

## 6. A Guide to Project Philosophy

This document is more than a technical manual; it is a guide to the project's philosophy. The conventions and architectural patterns described here are not arbitrary rules, but deliberate choices made to uphold a core set of values: architectural purity, user-centric design, and a commitment to high-craft execution. Every contribution should be measured against these principles to ensure the project remains cohesive, maintainable, and a pleasure to both use and develop.