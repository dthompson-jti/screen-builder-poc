### 2. `ARCHITECTURE_GUIDE.md` (New and Consolidated)

```markdown
# Screen Studio: Architecture Guide

This document outlines the core architectural principles, patterns, and contracts that guide the design and development of the Screen Studio application.

## 1. System Principles

These foundational rules ensure a consistent, high-craft, and maintainable user experience.

-   **Single Source of Truth:** Every piece of data and every visual element must have one, and only one, unambiguous source of truth. State is managed centrally (Jotai), styling is encapsulated within components, and content is separated from presentation.
-   **Intrinsic Sizing and Natural Flow:** Components and layouts are intrinsically sized by default. We avoid fixed heights in favor of `min-height` and modern CSS (Flexbox, Grid) to allow content to flow naturally. The canvas feels like a fluid, living document.
-   **State-Driven Appearance:** The UI reflects the application's state by changing the appearance of existing elements (via modifier classes or `data-attributes`), not by swapping out chunks of the DOM. This ensures UI stability and eliminates jarring visual jumps.
-   **High-Craft Transitions:** All state changes are communicated through smooth, purposeful transitions on performant CSS properties (`transform`, `opacity`, etc.).

## 2. State Management Architecture

The project uses **Jotai** for its minimal, atomic state management model. State is divided into two tiers:

1.  **UI State (`src/data/atoms.ts`):** Manages the "control panel" of the UI—panel visibility, active tabs, modal states, and the current interaction mode of the canvas (idle, selecting, editing).
2.  **Core Application State (`src/data/historyAtoms.ts`):** The most critical state file. It manages the actual structure of the form being built and implements the entire undo/redo system using a **reducer pattern**.

### The Golden Rule: `commitActionAtom`

To modify the canvas state, you **must** use the `commitActionAtom`. This is a write-only atom that acts as the central dispatcher for all mutations. This ensures every change is predictable, testable, and automatically recorded in the undo/redo history.

**Workflow:**
1.  Import `useSetAtom` and `commitActionAtom`.
2.  Get the dispatcher function: `const commitAction = useSetAtom(commitActionAtom);`
3.  Dispatch a strongly-typed action with a message:
    ```typescript
    commitAction({
      action: {
        type: 'COMPONENT_ADD',
        payload: { /* ... */ }
      },
      message: "Add 'New Component'"
    });
    ```

## 3. Styling Architecture

The project uses a **hybrid CSS architecture** organized into three layers via `@layer` in `src/index.css` to control specificity.

1.  **`base` Layer (Global Utilities):** Defines the application's visual language.
    *   `design-tokens.css`: The single source of truth for all color, spacing, and shadow variables.
    *   `buttons.css`, `forms.css`, etc.: Global classes for common UI elements. These are imported **only** in `index.css`.

2.  **`components` Layer (Data-Driven Appearance):**
    *   `appearance.css`: Uses `data-attributes` (e.g., `[data-appearance-type="primary"]`) to apply shared appearance styles for components rendered in both the editor and the final preview.

3.  **Unlayered (CSS Modules):** The default for component-specific styling.
    *   **Pattern:** A component (`MyComponent.tsx`) is co-located with its style file (`MyComponent.module.css`).
    *   **Scoping:** The build process automatically makes class names unique, **guaranteeing** no style collisions. This is the standard for component layout and specific styles.

## 4. Canvas & Drag-and-Drop Architecture

The canvas and DnD systems are built on a contract of **stability and clarity**.

### Canvas & Layout Contracts
-   **The Placeholder is a State:** The "empty canvas" placeholder is simply content rendered inside the root `LayoutContainer` when it has no children. The container itself is always present and is the single source of truth for its border and background. This architecture definitively eliminates all "double border" bugs.
-   **Intrinsic Growth:** The form card has a `min-height` when empty but grows naturally to fit its content.
-   **Editor-Only Artifacts:** UI related to selection, editing, and drag-and-drop (e.g., selection toolbars, outlines) exists **only** within the `Editor` feature and is absent from the `FormRenderer` used in Preview Mode.

### Drag-and-Drop (DnD) Contracts
-   **Stability Above All:** All "make space" animations from `dnd-kit` are programmatically disabled during a drag operation. This keeps the layout "rock solid" and prevents drop targets from shifting.
-   **Minimalist Visual Feedback:** Only the immediate `LayoutContainer` being hovered over receives a "drop-active" visual state. There is no distracting global highlighting.
-   **Centralized Logic:** All DnD event handling (`onDragStart`, `onDragOver`, `onDragEnd`) is encapsulated within the `src/data/useCanvasDnd.ts` hook.

## 5. Navigator & Breadcrumb Architecture

The Data Navigator provides a high-craft experience for navigating hierarchical data, built on the following principles:

-   **Separation of Concerns:** The complex, multi-phase animation logic is encapsulated within a vanilla JavaScript class (`src/data/navigator.js`). The React component (`DataNavigatorView.tsx`) acts as an orchestrator, managing state (via Jotai) and listening for DOM events dispatched by the navigator instance.
-   **Authoritative Animation Timeline:** GSAP is used for its robust timeline features to explicitly sequence the slide and cross-fade animations, preventing race conditions and visual glitches.
-   **Unidirectional Data Flow:** User clicks call methods on the `navigator.js` instance. The instance runs its animation timeline and dispatches a `navigate` event. The React component listens for this event and updates the central `selectedNodeId` atom, which triggers a re-render of the UI to reflect the new state. This creates a clean, predictable flow.