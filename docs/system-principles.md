# System Principles

This document outlines the core principles that guide the design and development of the Screen Studio application. These are the foundational rules that ensure a consistent, high-craft, and maintainable user experience.

## 1. Single Source of Truth

Every piece of data and every visual element must have one, and only one, unambiguous source of truth.

-   **State:** Application state is managed centrally (Jotai) and flows unidirectionally. The URL is the source of truth for shareable view states (e.g., Preview Mode).
-   **Styling:** A component is solely responsible for its own appearance. A parent container must not attempt to style its children's internals, and a child must not rely on a specific parent for its styling to function.
-   **Content:** HTML is for structure and data. CSS is for presentation. A component's text labels, especially when responsive, should be managed in CSS (`content: '...'`) rather than duplicating markup.

## 2. Intrinsic Sizing and Natural Flow

Components and layouts should be intrinsically sized by default. They should naturally grow and shrink based on their content and the available space.

-   **Avoid Fixed Heights:** Use `min-height` only to establish a reasonable baseline for interaction (e.g., a drop target), but never a fixed `height` that prevents content from flowing naturally.
-   **Embrace Flexbox & Grid:** Use modern CSS layout models to manage alignment and distribution. Let the browser do the heavy lifting. The canvas should feel like a fluid, living document, not a rigid grid of boxes.

## 3. State-Driven Appearance, Not Markup Swapping

The UI should reflect the application's state by changing the appearance of existing elements, not by swapping out chunks of the DOM.

-   **Modifier Classes:** Use clear, state-based modifier classes (e.g., `.is-active`, `.is-empty`, `.drag-active`) or data attributes (`data-state="active"`) to apply styles.
-   **Stability:** An element's presence in the DOM should be stable. A component should not be unmounted and remounted just to change its appearance, as this is visually jarring and inefficient. The "rock solid" placeholder is a key example: it is always present when the canvas is empty, and only its parent's *appearance* changes during a drag.

## 4. High-Craft Transitions

All state changes should be communicated to the user through smooth, purposeful transitions. Abrupt jumps in the UI are unacceptable.

-   **Animatable Properties:** Transitions must only be applied to performant, animatable CSS properties (`transform`, `opacity`, `height`, `color`, etc.). Non-animatable properties (`display`) must not be used for state transitions.
-   **Purposeful Animation:** Animations should have a clear purpose. The Node Navigator's text cross-fade, for instance, smoothly handles the change of context without distracting the user. The animation should feel like a natural consequence of the user's action.
