# Drag and Drop (DnD) System

This document specifies the contracts for the canvas drag-and-drop system, ensuring a stable, predictable, and high-craft user experience.

## Core Principles

-   **Stability Above All:** The canvas layout must remain "rock solid" during a drag operation. Unrelated components, especially containers, must not shift or resize, as this creates a distracting and unpredictable drop target.
-   **Clarity of Intent:** The user must always have a single, unambiguous visual cue indicating exactly where their component will be placed upon release. Visual noise, such as flickering indicators or excessive highlighting, is unacceptable.
-   **Context-Aware Feedback:** The visual feedback (the drop indicator) must adapt to the layout of the target container (e.g., a line for a stack, a block for a grid).

## Architectural Contract

1.  **Programmatic Animation Control:** All "make space" animations provided by `dnd-kit` are programmatically disabled for the duration of any drag operation. The `transition` property of all sortable items is forced to `'none'`.
    -   **Rationale:** This is the definitive solution to prevent containers from shifting or resizing when an item is dragged over them. It prioritizes layout stability over smooth reordering animations *during* the drag.

2.  **Deterministic Placeholder Logic:** The position of the drop indicator line is calculated based on a stable logical index, which is then used to look up the precise coordinates of the target drop location.
    -   **Rationale:** This decouples the visual indicator from the unstable `over` element provided by `dnd-kit` when the cursor is in a gap, completely eliminating the "wobble" effect.

3.  **Layout-Specific Sorting Strategy:** The underlying `dnd-kit` sorting strategy is chosen dynamically based on the target container's layout (`verticalListSortingStrategy` for flexbox, `rectSortingStrategy` for grid).
    -   **Rationale:** This provides the DnD system with more accurate data, leading to a more stable and intuitive experience, especially in multi-column grids.

4.  **Minimalist Visual Feedback:**
    -   **Global Highlighting:** The entire form card **does not** change appearance during a drag.
    -   **Target Highlighting:** Only the immediate container being hovered over receives a "drop-active" visual state.
    -   **Grid Indicator:** The placeholder for grid layouts is a subtle inset ring, not a heavy, solid block, to align with the system's refined visual language.