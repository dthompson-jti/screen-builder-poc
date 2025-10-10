# Layout and Canvas Architecture

This document specifies the architecture and principles for the editor canvas, ensuring a stable, predictable, and intuitive user experience.

## The Canvas Placeholder: A "State," Not an "Object"

The most critical principle of the canvas is that the "empty" placeholder is a **state of the root container**, not a separate object with its own conflicting styles.

### Contract:

1.  **The Root Container Owns its Appearance:** The root `LayoutContainer` is the single source of truth for its border, background, and padding.
2.  **The Empty State is Pure Content:** The `<CanvasEmptyState>` component has **no border or background**. It is a transparent block of content that is centered within the root container.
3.  **Stability is Paramount:** The root container's dimensions are stable. When a user drags a component over the empty canvas:
    *   The root container's border and background change to reflect the "drop-active" state.
    *   The `<CanvasEmptyState>` content (text and icon) **remains visible and perfectly stable**.
    *   The size of the drop target **does not change**.

This architecture guarantees a "rock solid" canvas that is predictable and eliminates all "double border" bugs.


*(Image placeholder for a diagram showing the root container with and without the empty state content)*

## Intrinsic Growth

The canvas form area is designed to grow naturally with its content.

-   **Initial State:** The form card has a `min-height` to provide an ample, comfortable drop target when empty. It is vertically centered within the canvas view.
-   **Growth:** As components are added, the form card's height expands intrinsically to wrap the content. It does not have a fixed or max height.

## Editor-Only Padding

To improve legibility and provide a clear visual separation between a component and its selection/hover state, all components on the canvas have a small, consistent padding applied via the `.formComponentWrapper`.

-   **Contract:** This padding is an **editor-only artifact**.
-   **Implementation:** It is applied by `EditorCanvas.module.css` and is therefore not present in the `FormRenderer` used for Preview Mode, ensuring a pixel-perfect final output.