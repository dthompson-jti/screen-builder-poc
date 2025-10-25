Of course. Here is a comprehensive Product Requirements Document (PRD), UX Specification, and Architecture Specification designed to be a single source of truth for a developer to implement the requested updates.

---

## **Project: Screen Studio UI Refresh - Button System & Style Cascade**

*   **Version:** 1.0
*   **Date:** 2024-07-25
*   **Author:** AI Assistant
*   **Status:** Approved for Implementation

### **1. Product Requirements Document (PRD)**

#### **1.1. Background**

The Screen Studio application is founded on the principles of **stability, clarity, and craft**. Our current button and interaction styling, while functional, has several areas for improvement. We lack a small button size, have inconsistencies in hover/pressed states, and the visual language of buttons is not fully shared with other interactive elements like inputs and menus. This initiative aims to refine our core UI component system to better reflect our design principles, improve the end-user experience through more polished interactions, and enhance the developer experience by creating a more systematic and maintainable styling architecture.

#### **1.2. Goals & Objectives**

*   **Enhance Visual Craft:** Introduce a more refined and consistent set of button styles, sizes, and interaction states.
*   **Improve UI Cohesion:** Cascade the updated interaction language to form inputs, menus, and list items for a unified look and feel.
*   **Guarantee UI Stability:** Ensure that no user interaction (like hovering or clicking) causes layout shifts on any component.
*   **Increase System Scalability:** Evolve the CSS and component architecture to be more robust, semantic, and easier to extend in the future.
*   **Improve Developer Experience:** Create a clear, type-safe, and reusable `<Button>` component to reduce ambiguity and enforce design standards.

#### **1.3. User Stories**

*   **As a Designer,** I want a flexible button system with multiple sizes, including a very small (`xs`) option, so I can create more compact and information-dense UIs where needed.
*   **As an End-User,** I want all interactive elements (buttons, inputs, menu items) to have consistent and predictable visual feedback on hover and click, without any distracting page reflow.
*   **As a Developer,** I want a single, composable `<Button>` component with clear props for `variant` and `size`, so I can build UIs faster and with fewer styling errors.
*   **As a Developer,** I want our styling architecture to be clear and maintainable, so that future updates are straightforward and have a low risk of regressions.

#### **1.4. Requirements**

1.  **New 'xs' Button Size:** A new, extra-small button size must be added to the system with the specified dimensions.
2.  **Icon-Only Variants:** Each button size (`xs`, `s`, `m`, `l`, `xl`) must have a corresponding `icon-only` variant with a distinct, larger `border-radius`.
3.  **Style Updates:** The `pressed` state of the secondary button and the `hover`/`pressed` states for tertiary, quaternary, and `on-solid` buttons must be updated to match the new border and background specifications.
4.  **Style Cascade:** The updated tertiary/quaternary interaction styles must be applied to:
    *   All text inputs and search inputs.
    *   Component browser list items.
    *   All menu items (context menus, dropdowns, etc.).
5.  **Architectural Refinements:** The implementation should include recommended refactoring to improve the overall quality and maintainability of the styling system.

#### **1.5. Success Metrics**

*   A new `<Button size="xs">` is available and visually correct.
*   All button variants and sizes have a visually distinct `icon-only` style.
*   The updated border and background styles are implemented pixel-perfectly across all specified button states.
*   Inputs, menus, and list items share the same hover/active visual language as the updated buttons.
*   **Critical:** No layout shift is observable when hovering or clicking on any updated component.
*   The codebase is cleaner, with a new `<Button>` component replacing scattered `className` implementations and redundant CSS being consolidated.

---

### **2. UX & Visual Specification**

This section details the precise visual and interactive requirements for the updated components.

#### **2.1. New Design Tokens**

The following tokens must be added to `src/design-tokens.css` to support the new styles.

```css
/* src/design-tokens.css */

:root {
  /* ... existing tokens ... */

  /* --- NEW: Radii --- */
  --radius-md: 0.5rem;   /* 8px */
  --radius-lg: 0.625rem; /* 10px */
  --radius-xl: 0.75rem;  /* 12px */
  --radius-2xl: 1rem;    /* 16px */

  /* --- NEW/UPDATED: Semantic Control Tokens --- */
  --control-bg-secondary-pressed: var(--primitives-grey-100); /* #E2E2E4 */
  --control-border-quaternary-hover: var(--primitives-dark-tint-700); /* rgba(0,0,0,0.15) */
  --control-border-quaternary-pressed: var(--primitives-dark-tint-600); /* rgba(0,0,0,0.28) */
}
```

#### **2.2. Button System Specification**

The button system will be defined by `variant`, `size`, and an optional `iconOnly` boolean flag.

**2.2.1. Button Sizes**

| Size | `data-size` | Height | Padding (Text) | Padding (Icon-Only) | Radius (Text) | Radius (Icon-Only) | Icon Size |
| :--- | :---------- | :----- | :------------- | :------------------ | :------------ | :----------------- | :-------- |
| XS | `xs` | 1.5rem | `0.5rem 0.375rem` | `0.5rem` | `--radius-md` | `--radius-md` | 16px |
| S | `s` | 34px | `var(--spacing-1p5)` | `var(--spacing-1p5)` | `--spacing-2` | `--radius-lg` | 20px |
| M | `m` | 38px | `var(--spacing-2) var(--spacing-4)` | `var(--spacing-2)` | `--spacing-2` | `--radius-xl` | 20px |
| L | `l` | TBD | TBD | TBD | TBD | `--radius-xl` | 24px |
| XL | `xl` | TBD | TBD | TBD | TBD | `--radius-2xl` | 24px |

*Note: `s` and `m` sizes map to the existing `tertiary`/`quaternary` and `primary`/`secondary` buttons respectively. `l` and `xl` are placeholders for future expansion.*

**2.2.2. Button State Styles**

| Variant | State | Background | Border | Box Shadow (Inset) |
| :--- | :--- | :--- | :--- | :--- |
| **Secondary**| Pressed | `var(--control-bg-secondary-pressed)` | `var(--control-border-secondary-pressed)` | `inset 0 -2px 0 0 var(...)` |
| **Tertiary** | Hover | `var(--control-bg-tertiary-hover)` | `1px solid var(--control-border-tertiary-faint-hover)` | `inset 0 -2px 0 0 var(--control-border-tertiary-hover)` |
| | Pressed | `var(--control-bg-tertiary-pressed)`| `1px solid var(--control-border-tertiary-faint-pressed)` | `inset 0 -2px 0 0 var(--control-border-tertiary-pressed)` |
| **Quaternary**| Hover | `var(--control-bg-quaternary-hover)` | `1px solid var(--control-border-quaternary-hover)` | `none` |
| | Pressed | `var(--control-bg-quaternary-pressed)`| `1px solid var(--control-border-quaternary-pressed)` | `none` |
| **On Solid** | Hover | `var(--control-bg-on-solid-hover)` | `1px solid var(--control-border-tertiary-faint-hover)` | `inset 0 -2px 0 0 var(--control-border-tertiary-hover)` |
| | Pressed | `var(--control-bg-on-solid-pressed)`| `1px solid var(--control-border-tertiary-faint-pressed)` | `inset 0 -2px 0 0 var(--control-border-tertiary-pressed)` |

#### **2.3. Interaction Cascade Specification**

*   **Form Inputs (`input[type="text"]`, `textarea`):**
    *   **Rest State:** Transparent background, `1px solid var(--surface-border-primary)`.
    *   **Hover State:** `background-color: var(--control-bg-quaternary-hover)`, `border-color: var(--control-border-quaternary-hover)`.
    *   **Focus State:** Retain existing theme-colored border and focus ring (`box-shadow`).
*   **Search Input (`.wrapper[data-variant="standalone"]`):**
    *   **Rest State:** `background-color: var(--surface-bg-primary)`, `border-color: var(--surface-border-primary)`.
    *   **Hover State:** `background-color: var(--surface-bg-primary)`, `border-color: var(--control-border-quaternary-hover)`.
    *   **Focus State:** Retain existing theme-colored border and focus ring.
*   **Component List Items (`.componentListItem`):**
    *   **Hover State:** `background-color: var(--control-bg-quaternary-hover)`, `box-shadow: inset 0 0 0 1px var(--control-border-quaternary-hover)`.
*   **Menu & Select Items (`.menu-item`, `.selectItem`):**
    *   **Hover/Highlighted State:** `background-color: var(--control-bg-tertiary-hover)`, `box-shadow: inset 0 0 0 1px var(--control-border-tertiary-faint-hover)`. Remove any existing inset shadows on `menu-item`.

---

### **3. Architecture Specification**

#### **3.1. Core Strategy: Data-Attribute Driven Component Architecture**

We will deprecate the BEM-style modifier classes (`.btn-primary`, `.icon-only`) in favor of a `data-attribute` system. This provides superior semantic clarity, simplifies complex style combinations, and aligns with best practices from modern UI libraries. This system will be encapsulated within a new, single `<Button>` component.

#### **3.2. New Component: `<Button>`**

A new file, `src/components/Button.tsx`, will be created.

*   **API:**
    ```typescript
    interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
      variant?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'on-solid';
      size?: 'xs' | 's' | 'm'; // Expandable
      iconOnly?: boolean;
      asChild?: boolean; // For polymorphism via Radix Slot
      children: React.ReactNode;
    }
    ```
*   **Implementation:**
    *   The component will render a `<button>` element (or a `Slot` from `@radix-ui/react-slot` if `asChild` is true).
    *   Props like `variant`, `size`, and `iconOnly` will be translated into `data-variant`, `data-size`, and `data-icon-only` attributes on the rendered element.
    *   It must forward all other standard button props (`onClick`, `disabled`, `aria-label`, `...rest`).
    *   The base `className="btn"` will be applied, but all modifiers will be handled by the data attributes.

#### **3.3. CSS Refactoring**

*   **`src/buttons.css`:** This file will be completely refactored.
    *   **Before:** `.btn-primary { ... }`, `.btn-secondary { ... }`
    *   **After:** `.btn[data-variant="primary"] { ... }`, `.btn[data-variant="secondary"] { ... }`
    *   The `inset box-shadow` technique will be used for all bottom "borders" to prevent layout shift, as it does not affect the element's box model. The `2px` bottom border will be implemented as `box-shadow: inset 0 -2px 0 0 var(...)`.
    *   The transition on the base `.btn` class will be updated to remove `transform`.

#### **3.4. Architectural Improvements**

*   **Adopt Radix UI for Menus:**
    *   **`HeaderMenu.tsx`:** Refactor to use `@radix-ui/react-dropdown-menu`. This will eliminate the custom `useOnClickOutside` hook and state management for visibility.
    *   **`CanvasContextMenu.tsx`:** Refactor to use `@radix-ui/react-context-menu`. This will eliminate all manual logic for positioning, visibility, and event handling.
    *   **Benefit:** This offloads complex, accessibility-critical logic to a robust, well-tested library, aligning with our **stability** and **craft** principles.
*   **Consolidate Animations:**
    *   All `@keyframes` rules (e.g., `fadeIn`) will be moved into `src/animations.css`. All other files will use the `.anim-fadeIn` utility class.
*   **Standardize CSS Layers:**
    *   The `@layer` directive will be removed from all CSS files except for `src/index.css`. The import order within `index.css` will be the single source of truth for the cascade layer order, improving **clarity**.

---

### **4. File Manifest**

This is a comprehensive list of files to be created, modified, or used for context.

#### **`src/`**

*   **`animations.css`**
    *   **Action:** Modify
    *   **Reason:** Consolidate all `@keyframes` definitions into this single file.
*   **`buttons.css`**
    *   **Action:** Modify (Heavy Refactor)
    *   **Reason:** Implement the new data-attribute styling system, add the `xs` size, and update all variant states (hover, pressed). This is the core of the styling changes.
*   **`design-tokens.css`**
    *   **Action:** Modify
    *   **Reason:** Add new `--radius-*` tokens and new/updated semantic color tokens for button states.
*   **`forms.css`**
    *   **Action:** Modify
    *   **Reason:** Apply updated tertiary/quaternary hover styles to `input[type="text"]` and `textarea`.
*   **`menu.css`**
    *   **Action:** Modify
    *   **Reason:** Update `.menu-item:hover` styles to align with the new tertiary button hover state.

#### **`src/components/`**

*   **`Button.tsx`**
    *   **Action:** Create
    *   **Reason:** New composable, type-safe button component that encapsulates the new styling system.
*   **`DataBindingModal.tsx`**
    *   **Action:** Modify
    *   **Reason:** Replace `<button className="...">` with the new `<Button>` component.
*   **`PanelHeader.tsx`**
    *   **Action:** Modify
    *   **Reason:** Replace `<button className="...">` with the new `<Button>` component.
*   **`ScreenToolbar.tsx`**
    *   **Action:** Modify
    *   **Reason:** Replace `<button className="...">` with the new `<Button>` component.
*   **`SearchInput.module.css`**
    *   **Action:** Modify
    *   **Reason:** Update hover/focus styles to align with new input styles. Update clear button to use new button styles.
*   **`Select.module.css`**
    *   **Action:** Modify
    *   **Reason:** Update `.selectItem[data-highlighted]` styles to align with the new tertiary button hover state.

#### **`src/features/AppHeader/`**

*   **`AppHeader.tsx`**
    *   **Action:** Modify
    *   **Reason:** Replace `<button className="...">` with the new `<Button>` component.
*   **`FormNameEditor.tsx`**
    *   **Action:** Modify
    *   **Reason:** Replace `<button className="...">` in the menu button with the new `<Button>` component.
*   **`HeaderMenu.tsx`**
    *   **Action:** Modify (Heavy Refactor)
    *   **Reason:** Re-implement the menu using `@radix-ui/react-dropdown-menu` for improved stability and accessibility.

#### **`src/features/ComponentBrowser/`**

*   **`panel.module.css`** (Context)
    *   **Action:** Modify
    *   **Reason:** This is a shared style file, but the correct path is `src/components/panel.module.css`. The change will be made there to update `.componentListItem` styles.

#### **`src/features/DataNavigator/`**

*   **`ConnectionsDropdown.tsx`**
    *   **Action:** Modify
    *   **Reason:** Replace `<button className="...">` with the new `<Button>` component.

#### **`src/features/Editor/`**

*   **`CanvasContextMenu.tsx`**
    *   **Action:** Modify (Heavy Refactor)
    *   **Reason:** Re-implement the context menu using `@radix-ui/react-context-menu` to eliminate custom positioning and state logic.
*   **`CanvasUI.tsx`**
    *   **Action:** Modify
    *   **Reason:** Replace `<button className="...">` in `FloatingSelectionToolbar` with the new `<Button>` component.
*   **`SelectionToolbar.tsx`**
    *   **Action:** Modify
    *   **Reason:** Replace `<button className="...">` with the new `<Button>` component.
*   **`SelectionToolbar.module.css`**
    *   **Action:** Context
    *   **Reason:** Contains styles for menu popovers that will be reused by the Radix components.

