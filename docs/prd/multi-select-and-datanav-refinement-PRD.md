Excellent. Based on the clarified requirements, here is the complete Product Requirements Document (PRD) for the Data Navigator enhancements and the canvas toolbar bug fix.

---

## **PRD: Data Navigator Multi-Select & UX Overhaul**

### 1. Overview

This document outlines the requirements for a significant enhancement to the Data Navigator feature. The primary goal is to improve user efficiency by introducing **multi-select** and **quick-add** capabilities, allowing users to add multiple data fields to the canvas in a single, fluid operation.

This initiative also includes a comprehensive UI/UX polish pass on the Data Navigator's list items to address text wrapping, spacing, and visual consistency, elevating the overall craft of the component. Finally, it addresses a critical regression bug affecting the positioning of the multi-select toolbar on the main canvas.

### 2. Problem & Goals

**Problem Statement:**
1.  **Inefficiency:** Adding multiple fields from the Data Navigator is a repetitive, one-by-one process that is tedious for users building complex forms.
2.  **Lack of Polish:** The Data Navigator's list items suffer from several UI inconsistencies: long names don't wrap, hover states are misaligned, and icon spacing doesn't match other selection components in the app.
3.  **Regression Bug:** The main canvas's multi-select action toolbar is incorrectly positioned, breaking a key workflow for power users.

**Goals:**
*   **Increase Efficiency:** Reduce the time and clicks required to add multiple data fields by at least 75% for bulk-add scenarios.
*   **Improve UX:** Create a fluid, intuitive, and industry-standard selection experience within the Data Navigator.
*   **Enhance Visual Craft:** Ensure the Data Navigator component is visually robust, responsive, and consistent with the application's established design system.
*   **Restore Core Functionality:** Resolve the canvas toolbar positioning bug to restore its intended UX.

### 3. Scope & Key Initiatives

**In Scope:**
*   **Initiative 1: Multi-Select in Data Navigator:**
    *   Implement Ctrl/Cmd+Click and Shift+Click selection logic.
    *   Display a floating action bar at the bottom of the panel when multiple items are selected.
    *   The action bar will contain a single action: "Add X Fields".
*   **Initiative 2: "Quick Add" on Hover:**
    *   Implement a "+" icon button that appears on list item hover for single-click adding.
*   **Initiative 3: Polish Data Navigator Item UI:**
    *   Ensure long item names wrap correctly.
    *   Ensure hover/selection backgrounds properly contain all content.
    *   Standardize icon/checkmark alignment using the global `.checkmark-container` pattern.
    *   Utilize available horizontal space more effectively.
*   **Initiative 4: Transient Field Icon Overlay:**
    *   Implement a "T" icon overlay for transient fields for better visual distinction.
*   **Initiative 5: Fix Canvas Multi-Select Toolbar Positioning:**
    *   Correct the CSS for the `ActionToolbar` component to ensure it is horizontally centered at the bottom of the viewport when in `mode="fixed"`.

**Out of Scope:**
*   Persistence of multi-select state when navigating between different data nodes.
*   Any bulk actions other than "Add Fields" (e.g., delete, edit).
*   Drag-and-dropping multiple selected items from the Data Navigator.

### 4. UX/UI Specification & Wireframes

#### 4.1. Core Interactions
*   **Selection Logic:**
    *   `Click`: Selects one item, deselects others.
    *   `Ctrl/Cmd + Click`: Toggles selection on an item.
    *   `Shift + Click`: Selects a range from the last selection anchor.
*   **Add Logic:**
    *   All "Add" actions (multi-select button, quick-add icon) will add the new component(s) to the end of the *currently selected container* on the canvas.
    *   If no container is selected on the canvas, components are added to the end of the root container.

#### 4.2. Wireframe: Data Navigator List Item
The list item will be refactored to use the `.menu-item` global style, with internal flexbox for responsiveness.

**State 1: Default & Hover with "Quick Add"**
```
  |<- var(--spacing-4) ->|
  +-------------------------------------------------------------+
  | .menu-item                                                  |
  | +---------------------------------------------------------+ |
  | |[ICON]  First Name                                     |+|| <-- Quick Add Button (opacity: 0 -> 1 on hover)
  | +---------------------------------------------------------+ |
  |                                                             |
  | +---------------------------------------------------------+ |
  | |[ICON]  A Data Field With A Very Long Name That Will...  |+||
  | |        ...now wrap correctly within the container.      | |
  | +---------------------------------------------------------+ |
  |                                                             |
  +-------------------------------------------------------------+
   ^                                                           ^
   |-- Hover BG: var(--control-bg-tertiary-hover) ---------------|
```
*   **Alignment:** Icon and Checkmark will be inside a `.checkmark-container` for perfect horizontal alignment with `Select.tsx`.
*   **Responsiveness:** The text label will use `flex: 1` and `min-width: 0` to wrap gracefully as the panel is resized.

#### 4.3. Wireframe: Multi-Select with Action Bar
```
+-------------------------------------------------------------+
| [Search...]                                                 |
|-------------------------------------------------------------|
| [x] Field: Last Name                                        | <-- Selected State: bg: var(--control-bg-selected)
| [x] Field: Email Address                                    |
| [ ] Field: Phone Number                                     |
|                                                             |
|                                                             |
|                                                             |
|=============================================================|
| .actionToolbar (mode="fixed")                               |
| +---------------------------------------------------------+ |
| | [ 2 selected ]       [ Add 2 Fields ](variant="primary")| |
| +---------------------------------------------------------+ |
+-------------------------------------------------------------+
 ^-- Shadow: var(--surface-shadow-lg)
```
*   **Positioning:** The action bar will be positioned at the bottom of the scrollable list container, remaining visible on scroll.
*   **Styling:** The bar will reuse the generic `ActionToolbar` component, inheriting its brand background and styling.

### 5. Architecture & Implementation Plan

*   **State Management (Jotai):**
    *   Introduce two new atoms in a new file `src/features/ComponentBrowser/dataNavigatorAtoms.ts` to keep its state localized:
        *   `dataNavigatorSelectedIdsAtom = atom<string[]>([]);`
        *   `dataNavigatorSelectionAnchorIdAtom = atom<string | null>(null);`
*   **Component Logic:**
    *   **`SelectableListItem.tsx`**: Will be refactored to use the new Jotai atoms to manage its own selection state and derive `isSelected`. The `onClick` handler will be expanded to implement the full multi-select logic. It will also render the new "Quick Add" button.
    *   **`DataNavigatorView.tsx`**: Will read `dataNavigatorSelectedIdsAtom` to conditionally render the `ActionToolbar` at the bottom of the list container. The "Add" button's `onClick` will gather the selected component data and dispatch the bulk add action.
    *   **`historyAtoms.ts`**: The reducer for `commitActionAtom` will be extended with a new case, `'COMPONENTS_ADD_BULK'`, which will accept an array of components and a target parent ID.
*   **CSS:**
    *   **`panel.module.css`**: The styles for the list item text will be modified to support wrapping. New styles will be added for the "Quick Add" button and the transient icon overlay (`.icon-wrapper`, `.overlay-icon`).
    *   **`ActionToolbar.module.css`**: The `.fixed` class will be corrected to use `position: fixed`, `bottom`, `left: 50%`, and `transform: translateX(-50%)` to restore the centered positioning for the canvas toolbar.

### 6. File Manifest

*   **State Management:**
    *   `[NEW]` `src/features/ComponentBrowser/dataNavigatorAtoms.ts`
    *   `[MODIFIED]` `src/data/historyAtoms.ts` - To add the `COMPONENTS_ADD_BULK` action.
    *   `[REFERENCE]` `src/data/atoms.ts` - For understanding existing state patterns.
*   **Components:**
    *   `[MODIFIED]` `src/components/SelectableListItem.tsx` - Core logic for selection, UI changes.
    *   `[MODIFIED]` `src/features/DataNavigator/DataNavigatorView.tsx` - To render the action bar.
    *   `[MODIFIED]` `src/components/ActionToolbar.tsx` - To adjust fixed positioning logic.
    *   `[MODIFIED]` `src/features/Editor/CanvasUI.tsx` - The `FloatingMultiSelectToolbar` is rendered here; its parent `ActionToolbar` is being fixed.
*   **Styling:**
    *   `[MODIFIED]` `src/components/panel.module.css` - For list item wrapping, width, and icon overlay styles.
    *   `[MODIFIED]` `src/components/ActionToolbar.module.css` - To fix the `.fixed` class positioning.
    *   `[REFERENCE]` `src/styles/menu.css` - To ensure consistency with `.menu-item`.
*   **Types:**
    *   `[REFERENCE]` `src/types.ts` - No changes expected, but relevant for component data structures.

### 7. Unintended Consequences Check

*   **`ActionToolbar.module.css`**: The primary risk. Fixing the `fixed` style for the canvas toolbar might affect other potential uses of this generic component. A thorough check of all `ActionToolbar` instances is required.
*   **`panel.module.css`**: Changes to list item styles could inadvertently affect other elements if class names are not sufficiently specific. The changes should be scoped to the component list within the Data Navigator.
*   **`historyAtoms.ts`**: Adding a new action to the core state reducer is a critical path. It must be thoroughly tested, including undo/redo functionality for the new bulk-add action.

### 8. Risks & Mitigations

*   **Risk:** CSS changes for responsive item text wrapping prove complex or negatively impact performance.
    *   **Mitigation:** Use modern CSS (`flex: 1`, `min-width: 0`) which is highly performant. Test resizing the panel extensively during development.
*   **Risk:** The floating action bar's position is inconsistent across browsers or interferes with the scrollbar.
    *   **Mitigation:** Use `position: sticky` if the parent container allows, or `position: absolute` with `padding-bottom` on the scrollable container to create space. Test in Chrome, Firefox, and Safari.
*   **Risk:** The "Quick Add" action feels slow if the state update and canvas re-render is not performant.
    *   **Mitigation:** The action dispatches to the existing `commitActionAtom`, which is already optimized. The risk is low, but should be verified with a "tap-fire" test (clicking the "+" button rapidly).

### 9. Definition of Done

1.  **Multi-Select Functionality:**
    *   [ ] User can select a single item by clicking.
    *   [ ] User can toggle item selection with Ctrl/Cmd+Click.
    *   [ ] User can select a range of items with Shift+Click.
    *   [ ] A floating action bar appears when 1 or more items are selected.
    *   [ ] The action bar correctly displays the number of selected items.
    *   [ ] Clicking "Add X Fields" adds all selected items to the selected canvas container (or root).
    *   [ ] The bulk-add action is correctly registered in the undo/redo history.
2.  **Quick-Add & UI Polish:**
    *   [ ] A "+" button appears on list item hover.
    *   [ ] Clicking the "+" button adds the single item to the canvas and is undoable.
    *   [ ] Long item names wrap correctly and do not break the layout.
    *   [ ] Hover and selected states have backgrounds that fully contain the item content.
    *   [ ] Icon and checkmark alignment is pixel-perfect and consistent with `Select` menus.
    *   [ ] List items responsively use the available width in the panel.
    *   [ ] Transient field icons correctly display the "T" overlay.
3.  **Bug Fix:**
    *   [ ] The multi-select toolbar on the main canvas is now correctly positioned (horizontally centered, fixed at the bottom of the viewport).