# Drag and Drop (DnD) System Architecture

This document specifies the architectural contracts for the canvas drag-and-drop system, ensuring a stable, predictable, and high-craft user experience.

## Core Principles

-   **Stability Above All:** The canvas layout must remain "rock solid" during a drag operation. Unrelated components, especially containers, must not shift or resize, as this creates a distracting and unpredictable drop target.
-   **Clarity of Intent:** The user must always have a single, unambiguous visual cue indicating exactly where their component will be placed upon release. Visual noise, such as flickering indicators or excessive highlighting, is unacceptable.
-   **Context-Aware Feedback:** The visual feedback (the drop indicator) must adapt to the layout of the target container (e.g., a line for a stack, an inset ring for a grid).

## Architectural Contract

1.  **Programmatic Animation Control:** All "make space" animations provided by `dnd-kit` are programmatically disabled for the duration of any drag operation. The `transition` property of all sortable items is forced to `'none'` when a drag is active.
    -   **Rationale:** This is the definitive solution to prevent containers from shifting or resizing when an item is dragged over them. It prioritizes layout stability over smooth reordering animations *during* the drag.

2.  **Deterministic Placeholder Logic:** The position of the drop indicator is calculated in `useCanvasDnd.ts` based on a stable logical index and the viewport-relative coordinates of the element being hovered over.
    -   **Rationale:** This decouples the visual indicator from the sometimes-unstable `over` element provided by `dnd-kit` (especially when the cursor is in a gap between elements), completely eliminating the "flickering" or "wobbling" effect.

3.  **Minimalist Visual Feedback:** The system avoids overwhelming the user with visual noise.
    -   **Global Highlighting:** The entire form card **does not** change appearance during a drag.
    -   **Target Highlighting:** Only the immediate `LayoutContainer` being hovered over receives a "drop-active" visual state (a subtle background color and border change).
    -   **Grid Indicator:** The placeholder for grid layouts is a subtle inset ring effect, not a heavy, solid block, aligning with the system's refined visual language.

4.  **Centralized Logic in `useCanvasDnd`:** All DnD event handling logic (`handleDragStart`, `handleDragOver`, `handleDragEnd`) is encapsulated within the `src/data/useCanvasDnd.ts` custom hook. This hook is the sole owner of DnD state and is responsible for dispatching the appropriate `commitActionAtom` actions to mutate the canvas state.