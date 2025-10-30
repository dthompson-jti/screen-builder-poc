# High-Craft CSS Principles

This document codifies the core principles and patterns for writing CSS in the Screen Studio project. Adhering to these guidelines is essential for maintaining a consistent, robust, and high-craft user interface.

---

### Core Principles

#### 1. Master the Box Model, Especially Positioning

The CSS Box Model is not optional knowledge. Before using `position: absolute` or `position: fixed`, you must be able to answer:

-   **What is its "positioned ancestor"?** If none exists, it will be the viewport.
-   **How will it get its width and height?** Have I provided explicit dimensions (`width`, `height`) or constraints (`top`, `right`, `bottom`, `left`)?
-   Never assume an element will "just know" its size. You must declare it.

#### 2. Diagnose, Don't Guess

When debugging a UI issue, follow this simple diagnostic process to find the root cause instead of guessing at solutions:

1.  **Isolate:** Use the browser inspector to find the exact element that is failing.
2.  **Inspect:** Analyze its "Computed" styles. Don't just look at the CSS you wrote; look at what the browser *actually rendered*. A `width: 0px` or unexpected `margin` is the key clue.
3.  **Hypothesize:** Form a hypothesis based on CSS fundamentals. "My hypothesis is the element has no width because it's absolutely positioned without horizontal constraints."
4.  **Test:** Use the browser's style editor to test your hypothesis in real-time (e.g., add `left: 0; right: 0;`). If it works, you've found the solution.

#### 3. Trust, but Verify the Final DOM

React components, UI libraries (Radix), and animation libraries (Framer Motion) can all add wrapper `divs` or change the final DOM structure. Your React code is not the final source of truth—the browser's "Elements" panel is. Always debug the final rendered HTML, not the JSX you assume is being rendered.

---

### Key Architectural Patterns

#### The "Safe Zone" Padding Contract for Focus Rings

To ensure visual consistency and prevent UI bugs, we have standardized on a **`2px` outer focus ring** for all interactive components.

-   **Problem:** Parent containers with `overflow: hidden` (like accordions) will clip this outer focus ring, making it invisible and creating an accessibility issue.
-   **Solution (The Contract):** Any container component that must use `overflow: hidden` **must also provide an internal "safe zone" of padding** to accommodate the focus rings of its children.
-   **Implementation:** The standard safe zone is a `2px` padding (`var(--spacing-0p5)`). For example, our `Accordion` component's content area has this padding, guaranteeing that any form input placed inside can display its full `2px` outer focus ring without being clipped.

**The Exception: Menu Items**
Menu items (`.menu-item`) are the one justified exception to the outer focus ring rule. Because they are flush with the edges of a rounded-corner popover, an outer shadow would be clipped. Therefore, menu items use a robust **`inset 0 0 0 2px var(...)` box-shadow** for their keyboard focus state (`[data-highlighted]:focus-visible`).

#### The Shared Menu System (`menu.css`)

To enforce the "Single Source of Truth" principle for our UI, we use a shared, global stylesheet for all list-based selection components. This system guarantees that primitives from multiple Radix UI packages (`DropdownMenu`, `ContextMenu`, `Select`) and custom components (like the **Data Navigator's item list in both the main panel and the data binding modal**) are visually indistinguishable.

It is built on two key patterns:

1.  **Shared Container (`.menu-popover`):** All menu popovers use this class, which defines the container's shape, shadow, padding, and a **`gap: 2px`** to create consistent spacing between items.
2.  **Shared Item (`.menu-item`):** All list items use this class. It defines a consistent height, internal padding, and a `1px solid transparent` border in its resting state. On hover or highlight, only the `background-color` and `border-color` are changed, preventing any layout shift. This creates a light, modern interaction style.

By composing these two classes, we achieve a perfectly consistent and robust menu system across the entire application.

#### The Icon Badging Pattern for Visual Status

To add secondary information to an icon without cluttering the UI, we use a CSS-only "badging" pattern.

-   **Problem:** A component or data field (e.g., a "transient" field) has a special status that needs to be communicated visually at a glance.
-   **Solution:** A wrapper `div` with `position: relative` is placed around the base icon. A second, smaller "badge" icon (e.g., the "T" for transient) is then absolutely positioned at the top-right corner of the wrapper.
-   **Implementation:** The badge icon is given a smaller `font-size` and a matching `opsz` (optical size) for clarity, and a `text-shadow` can be used to lift it visually from the base icon. This creates a clean, scalable, and high-craft way to badge icons with status indicators.