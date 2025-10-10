# Interactive Component Specifications

This document defines the contracts and expected behavior for key interactive UI components.

## Node Navigator

The Node Navigator is a high-craft component designed for fluid, intuitive navigation through a data hierarchy.

### Core Principles:

-   **Tactile Feel:** The component uses smooth animations to feel responsive and physical.
-   **Clarity of State:** The "Last," "Selected," and "Related" nodes are always clearly delineated.
-   **Responsive Grace:** The component gracefully adapts to smaller container sizes without sacrificing functionality or clarity.

### Architectural Contract:

1.  **Unified HTML Structure:** The labels below the nodes ("Last," "Selected," "Related") use a single, minimal HTML structure. The actual text content is injected via CSS `::after` pseudo-elements.
    -   **Rationale:** This makes it architecturally impossible for duplicate text labels to appear and cleanly separates data (the connection count) from presentation (the label text).

2.  **Container Query Driven:** The navigator's transition from its standard to its compact layout is driven by a CSS container query (`@container`).
    -   **Rationale:** This makes the component fully self-contained and reusable. It adapts based on the space it is *given*, not on the global viewport size.

### Animation Contract:

-   **Node Transition:** When navigating, the track of nodes slides horizontally with a `power3.inOut` ease for a smooth acceleration and deceleration.
-   **Text Transition:** The text inside the node buttons does not slide. It performs a **cross-fade**:
    1.  Existing text fades to `opacity: 0`.
    2.  The track slides to its new position.
    3.  The new text content is swapped instantly (while invisible).
    4.  The new text fades to `opacity: 1`.
    -   **Rationale:** This prevents the jarring effect of long text labels sliding across the screen and provides a more polished, less distracting transition.
-   **Height Transition:** When the component enters its compact state, its overall height and the height of the node buttons animate smoothly over `0.3s`. The spacing between the nodes and the labels below also animates via `padding-top` transitions.