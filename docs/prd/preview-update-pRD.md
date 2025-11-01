Of course. Based on your feedback and the new files, here is a comprehensive Product Requirements Document (PRD) to guide the development of a high-craft, read-only Preview Mode and the associated architectural cleanup.

---

### **Product Requirements Document: Preview Mode Overhaul & Architectural Polish**

#### 1. Overview

This document outlines the requirements for overhauling the application's "Preview Mode." The primary goal is to transform the existing, partially interactive preview into a true, read-only experience that accurately reflects the final user-facing form. This initiative also includes a critical architectural refinement to centralize canvas action logic, improving code quality and maintainability.

#### 2. Problem & Goals

**Problem:**
1.  The current Preview Mode is not truly a "preview"; it retains editor functionalities like component selection and interaction, creating a confusing and inaccurate user experience.
2.  The viewport control buttons in the `PreviewToolbar` are not functional or visually responsive (e.g., showing an active state) because they are implemented with plain HTML and CSS classes, bypassing the project's standardized, data-driven `Button` and `Toggle` components.

**Goals:**
1.  **UX Goal:** Ensure the Preview Mode is **100% read-only**. All editor-specific interactions (selection, drag-and-drop, context menus, floating toolbars) must be disabled.
2.  **Functional Goal:** Fix the `PreviewToolbar` controls to be fully functional, visually indicating their active state and correctly manipulating the preview viewport width.
3.  **Architectural Goal:** Uphold the project's "Golden Rule" by refactoring the `useEditorHotkeys` hook to delegate all canvas mutations to the `useCanvasActions` hook, eliminating code duplication and creating a single source of truth for action logic.

#### 3. Scope & Key Initiatives

**In Scope:**
*   **Initiative 1: Implement Read-Only Rendering:** Refactor `PreviewView.tsx` to use the existing `FormRenderer.tsx` component, which is architected for pure presentation.
*   **Initiative 2: Rebuild Toolbar with Standard Components:** Refactor `PreviewToolbar.tsx` to use the project's standard `Button` and `Toggle` components, ensuring correct styling, behavior, and state indication.
*   **Initiative 3: Consolidate Action Logic:** Refactor `useEditorHotkeys.ts` to remove duplicate logic and instead call the functions provided by `useCanvasActions.ts`.

**Out of Scope:**
*   Adding new layout container features or direct manipulation.
*   Implementing the "Layers" or "Settings" panel functionality.
*   Implementing data simulation or code generation in the Preview Mode.

#### 4. UX/UI Specification & Wireframes

**Core Interaction:**
1.  The user clicks the "Preview" tab in the `AppHeader`.
2.  The main content area transitions to the `PreviewView`.
3.  The `PreviewToolbar` is displayed at the top of the content area. The editor toolbars (left and right panels) are hidden.
4.  The form is rendered in the center of the viewport. The user **cannot** select, edit, or drag any components within the form.
5.  Interacting with the `PreviewToolbar` controls (e.g., clicking "Tablet" or toggling "Fit to Window") resizes the form's container smoothly. The URL parameters update accordingly via the existing `useUrlSync` hook.

**Wireframe: `PreviewToolbar`**

```
+-----------------------------------------------------------------------------------------+
| [ <open_in_full> ] | [ <smartphone> ] [ <tablet_mac> ] [ <desktop_mac> ] | [ 1280 ] px   |
|                                                                                         |
|  var(--surface-bg-primary)                                                              |
|  height: 56px                                                                           |
|  border-bottom: 1px solid var(--surface-border-secondary)                               |
+-----------------------------------------------------------------------------------------+
  |                  | |                      |                             |
  |                  | |                      |                             +-- .widthInputWrapper
  |                  | |                      +-- ToggleGroup of Buttons (variant="tertiary")
  |                  | +-- .verticalDivider
  |                  +-- A single <Toggle> wrapping a <Button variant="tertiary">
  +-- .previewToolbar (padding: 0 var(--spacing-4), gap: var(--spacing-4))
```

*   **Buttons:** All buttons will be implemented using the project's `<Button variant="tertiary" size="m" iconOnly>`.
*   **Active State:** The "Fit to Window" button will be a `<Toggle>` component to manage its pressed state. The device preset buttons will derive their active state from the `previewWidthAtom` and `isPreviewFluidAtom`.
*   **Consistency:** The toolbar's height, background, and border will match the main `AppHeader` for visual cohesion.

#### 5. Architecture & Implementation Plan

1.  **`PreviewView.tsx` Refactor:**
    *   **Problem:** This component currently renders an interactive canvas.
    *   **Solution:** The component's implementation will be replaced. It will now consist of two main children inside a flexbox container: `<PreviewToolbar />` and a scrollable canvas area. The canvas area will contain the `<FormRenderer />` component, which inherently renders a non-interactive view of the form. The width of the form's container will be dynamically controlled by the `isPreviewFluidAtom` and `previewWidthAtom`.

2.  **`PreviewToolbar.tsx` Refactor:**
    *   **Problem:** Buttons are implemented with `<button className="btn...">`, which bypasses the project's component system and causes them to be unstyled and non-functional.
    *   **Solution:**
        *   Replace all `<button>` elements with the project's `<Button>` component, providing the correct `variant`, `size`, and `iconOnly` props.
        *   Wrap the "Fit to Window" button in the `<Toggle asChild>` component to handle its on/off state automatically.
        *   The active state for preset buttons will be managed conditionally within the component: `className={!isFluid && width === p.width ? 'active' : ''}` will be added to the `<Button>` component. The global `buttons.css` should already have styles for an `.active` class on a button.

3.  **`useEditorHotkeys.ts` Refactor:**
    *   **Problem:** This hook duplicates action logic found in `useCanvasActions.ts`.
    *   **Solution:** The hook will be modified to import and use `useCanvasActions`. All `commitAction` calls related to canvas mutations (delete, wrap, unwrap, reorder) will be replaced with calls to the corresponding functions from the `actions` object (e.g., `actions.handleDelete()`, `actions.handleWrap()`). The logic for entering editing mode (`setInteractionState`) will be replaced with `actions.handleRename()`. This centralizes logic and adheres to the architectural principles.

#### 6. File Manifest

*   **`src/features/Preview/`**
    *   `PreviewView.tsx` **[MODIFIED]**
    *   `PreviewView.module.css` **[MODIFIED]**
    *   `PreviewToolbar.tsx` **[MODIFIED]**
    *   `PreviewToolbar.module.css` **[MODIFIED]**
*   **`src/data/`**
    *   `useEditorHotkeys.ts` **[MODIFIED]** - To delegate actions.
    *   `useCanvasActions.ts` **[REFERENCE]** - The source of truth for action logic.
    *   `atoms.ts` **[REFERENCE]** - Source of `isPreviewFluidAtom` and `previewWidthAtom`.
*   **`src/components/`**
    *   `FormRenderer.tsx` **[REFERENCE]** - The key to the read-only view.
    *   `Button.tsx` **[REFERENCE]** - Used to fix the toolbar.
    *   `Toggle.tsx` **[REFERENCE]** - Used to fix the "Fit to Window" button.
*   **`src/`**
    *   `App.tsx` **[REFERENCE]** - The root component that switches between `EditorCanvas` and `PreviewView`.

#### 7. Unintended Consequences Check

*   **`src/data/useUrlSync.ts`:** This hook interacts with the preview state atoms. It must be tested to ensure that manipulating the toolbar controls correctly updates the URL and that loading the app from a URL with preview parameters correctly sets the toolbar's state.
*   **`src/styles/buttons.css`:** The `PreviewToolbar` relies on the global button styles, including the `.active` state class. We must verify that a `tertiary` button with an `.active` class has a distinct, clear visual style. If not, a style for `[data-variant="tertiary"].active` may need to be added.
*   **`src/components/FormRenderer.tsx`:** Any recent changes to this component could affect the preview. A quick review is necessary to ensure it's up-to-date with all component renderers.

#### 8. Risks & Mitigations

*   **Risk:** The active state styling for the tertiary buttons in the `PreviewToolbar` might not be defined in the global CSS.
    *   **Mitigation:** Add a specific CSS rule in `buttons.css` for `[data-variant="tertiary"].active` to ensure it matches the visual language of other active/selected controls (e.g., using `var(--control-bg-selected)` and `var(--control-border-selected)`).
*   **Risk:** The refactor of `useEditorHotkeys.ts` could introduce a regression if a specific edge case is missed.
    *   **Mitigation:** Perform a targeted testing pass on all editor hotkeys after the refactor: Delete (single/multi), Wrap, Unwrap, Rename (Enter), and Nudge (Arrow keys).

#### 9. Definition of Done

*   [ ] When in Preview Mode, the form canvas is completely read-only; no component can be selected or edited.
*   [ ] The `PreviewToolbar` is visible and functional in Preview Mode.
*   [ ] The "Fit to Window" toggle button works and correctly reflects the `isFluid` state.
*   [ ] The device preset buttons (Mobile, Tablet, Desktop) work and correctly reflect the active `width`.
*   [ ] The width input field displays the current width and is disabled when "Fit to Window" is active.
*   [ ] The `useEditorHotkeys.ts` file no longer contains direct `commitAction` calls for canvas mutations and instead delegates to `useCanvasActions`.
*   [ ] All editor hotkeys function identically to how they did before the refactor.