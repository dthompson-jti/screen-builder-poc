Of course. Here is the fully rewritten PRD, incorporating the architectural decisions and refactoring plan into a single, comprehensive document.

---

# PRD: Editor Architecture Refinements v2.0

| Version | Status     | Author      | Date         |
| :------ | :--------- | :---------- | :----------- |
| 2.0     | Proposed   | AI Assistant| 2023-10-28   |

## 1. Overview

### 1.1. Executive Summary
This document outlines a series of architectural refinements for the Screen Studio editor. The primary goal is to increase code quality, reusability, and maintainability by addressing key areas of tight coupling and code duplication. We will achieve this by abstracting the canvas-specific selection toolbar into a generic `ActionToolbar` system, unifying the separate rendering paths for the editor and preview modes into a single source of truth, and refining the editor's directory structure for better discoverability. These changes will strengthen the codebase, making it easier to maintain and extend, while ensuring a more consistent and robust user experience.

## 2. Problem & Goals

### 2.1. Problem Statement
The editor's architecture, while functional, has developed several technical debts that hinder long-term velocity and maintainability:
1.  **Component-Specific Toolbar:** The `SelectionToolbar` is tightly coupled to the canvas, preventing its UI pattern from being easily reused in other parts of the application.
2.  **Dual Rendering Logic:** The visual representation of form components is defined in two separate places (`CanvasRenderers.tsx`/`previews` and `FormRenderer.tsx`). This leads to code duplication and creates a significant risk of visual inconsistency between the editor and the final preview.
3.  **Suboptimal Directory Structure:** The current `src/features/Editor/` directory structure could be flatter and more intuitive, improving developer experience and reducing cognitive overhead.

### 2.2. Goals
*   **Establish a Reusable UI Pattern:** Create a generic `ActionToolbar` component system that can be used for any selection-based actions across the application, adhering to the "Single Source of Truth" principle.
*   **Reduce Code Duplication:** Eliminate the redundant component rendering logic by creating a single, unified rendering path (DRY).
*   **Guarantee Visual Consistency:** Ensure that a component rendered on the canvas is visually identical to its counterpart in the final preview mode.
*   **Improve Maintainability:** Make the codebase easier to reason about, debug, and extend by clarifying component responsibilities and centralizing interaction logic into dedicated hooks.

## 3. Scope & Key Initiatives

### 3.1. Key Initiatives
1.  **The Generic `ActionToolbar` System:** Abstract the existing selection toolbars into a generic, presentational `<ActionToolbar>` container and a data-driven `<ActionMenu>` component. Centralize all canvas action logic (delete, wrap, etc.) into a new `useCanvasActions` hook.
2.  **Unified Component Rendering:** Create a new set of unified renderer components in a dedicated `src/features/Editor/renderers/` directory. Each renderer will accept a `mode: 'canvas' | 'preview'` prop to control editor-specific chrome. All editor interaction logic (selection, sorting) will be encapsulated in a new `useEditorInteractions` hook consumed by these renderers.
3.  **Directory Structure Refinement:** Reorganize the `src/features/Editor/` directory into a flatter, more pragmatic structure to improve code discoverability.

### 3.2. Out of Scope
*   **New User-Facing Features:** This initiative is a purely architectural refactoring. No new functionality will be added for the end-user.
*   **Formal Command Pattern:** The existing `commitActionAtom` reducer pattern is sufficient and will not be replaced.
*   **Data Navigator Refactoring:** While the `ActionToolbar` is designed for future use in the Data Navigator, its implementation there is out of scope for this PRD.

## 4. UX/UI Specification & Wireframes

### 4.1. The `ActionToolbar` System

#### Single-Item Selection Toolbar (Element-Relative)
When a single item is selected on the canvas, a toolbar appears centered above it. Its position is dynamically updated to track the element during scrolling.

```ascii
                  +-------------------------------------------------+
                  |  [ ] Rename  [ ] Smart Action  [v] More Options |
                  +-------------------------------------------------+
                  .                                                 .
                  .  var(--spacing-3) offset from top of selection  .
                  .                                                 .
+-----------------------------------------------------------------------------+
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  |                        Selected Canvas Component                        |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
+-----------------------------------------------------------------------------+

// STYLING NOTES:
// - Toolbar Container: background-color: var(--surface-bg-brand-solid);
//                      box-shadow: var(--surface-shadow-lg);
//                      border-radius: var(--spacing-2);
// - Buttons:           Uses <Button variant="on-solid" size="s" />
// - Menu Popover:      Uses global `.menu-popover` styles for consistency.
```

#### Multi-Item Selection Toolbar (Fixed Position)
When multiple items are selected, a toolbar appears at a fixed position at the bottom of the viewport.

```ascii
+-----------------------------------------------------------------------------+
|                                                                             |
|                                                                             |
|                            [ Canvas Viewport ]                              |
|                                                                             |
|                                                                             |
|                                                                             |
|                                                                             |
|               +-------------------------------------------+                 |
|               |  3 selected | [ ] Wrap  [ ] Repath  [ ] Del |                 |
|               +-------------------------------------------+                 |
|               .                                           .                 |
|               .  bottom: var(--spacing-6)                 .                 |
+-----------------------------------------------------------------------------+

// STYLING NOTES:
// - Toolbar Container: Same styles as single-selection toolbar.
// - Positioning:       Fixed to viewport, horizontally centered.
```

## 5. Architecture & Implementation Plan

### 5.1. Logic & State Encapsulation
The core of this refactor is to centralize logic into dedicated, reusable hooks:
*   **`useCanvasActions`:** A new hook that accepts `selectedIds` and returns a memoized object of all possible canvas mutation functions (`handleDelete`, `handleWrap`, etc.). This hook is the single place where `commitActionAtom` is called for canvas operations, making it the "brain" for actions.
*   **`useEditorInteractions`:** A new hook that encapsulates all the logic for making a component *interactive* on the canvas. It accepts a `component` object and returns all necessary props for sorting (`useSortable`), selection handling (`handleSelect`), and state flags (`isSelected`, `isEditing`).

### 5.2. Generic UI Components
Two new generic, presentational components will be created in `src/components/`:
*   **`<ActionToolbar />`:** A positioning and styling container powered by `@floating-ui/react-dom` to handle complex element-relative and fixed positioning.
*   **`<ActionMenu />`:** A data-driven component that renders a menu from an `items` array, ensuring perfect visual consistency with all other menus in the application by using the global `.menu-item` class.

### 5.3. Unified Rendering Pattern
A new directory, `src/features/Editor/renderers/`, will contain the single source of truth for component visuals.
*   **The `mode` Prop Contract:** Each renderer (e.g., `TextInputRenderer`) will accept a `mode: 'canvas' | 'preview'` prop.
*   **`mode="preview"`:** The renderer returns a pure, `React.memo`-ized "View" component with no editor logic. This path is used by `FormRenderer.tsx` and `DndDragOverlay.tsx`.
*   **`mode="canvas"`:** The renderer uses the `useEditorInteractions` hook to get interaction props, wraps the "View" component with the necessary `div`s for selection and sorting, and renders the `<CanvasSelectionToolbar />`. This path is used by `CanvasNode.tsx`.

### 5.4. Directory & Component Refactoring
*   `CanvasNode.tsx` will be simplified into a "router" that selects the correct unified renderer.
*   `FormRenderer.tsx` will be simplified to recursively call the unified renderers in `"preview"` mode.
*   The old `CanvasWrappers.tsx`, `CanvasRenderers.tsx`, `SelectionToolbar.tsx`, `SelectionToolbarMenu.tsx`, and the `previews/` directory will be deleted.
*   The `src/features/editor` directory will be renamed to `src/features/Editor` and its contents flattened.

## 6. File Manifest

### `src/components/`
*   `[NEW] ActionMenu.tsx`
*   `[NEW] ActionToolbar.module.css`
*   `[NEW] ActionToolbar.tsx`
*   `[MODIFIED] FormRenderer.tsx`

### `src/features/Editor/`
*   `[MODIFIED] App.tsx` (Path updates)
*   `[MODIFIED] CanvasNode.tsx`
*   `[MODIFIED] CanvasUI.tsx`
*   `[NEW] CanvasSelectionToolbar.tsx`
*   `[MODIFIED] DndDragOverlay.tsx`
*   `[MODIFIED] EditorCanvas.tsx`
*   `[MODIFIED] PropertiesPanel.tsx` (Path updates)
*   `[MODIFIED] PropertiesPanel/LayoutEditor.tsx` (Path updates)
*   `[NEW] useCanvasActions.ts`
*   `[NEW] useEditorInteractions.ts`

### `src/features/Editor/renderers/`
*   `[NEW] DropdownRenderer.tsx`
*   `[NEW] LayoutRenderer.tsx`
*   `[NEW] LinkRenderer.tsx`
*   `[NEW] PlainTextRenderer.tsx`
*   `[NEW] RadioButtonsRenderer.tsx`
*   `[NEW] TextInputRenderer.tsx`
*   `[NEW] types.ts`

### `[REFERENCE]` (For Context)
*   `README.md`
*   `src/data/atoms.ts`
*   `src/data/historyAtoms.ts`
*   `src/types.ts`
*   `src/features/Editor/useComponentCapabilities.ts`
*   `src/features/Editor/canvasUtils.ts`

## 7. Unintended Consequences Check
*   **`App.tsx`:** Imports from the `Editor` feature must be updated to reflect the new directory structure.
*   **`types.ts`:** The `useEditable` hook uses generics. Ensure the new renderers correctly type the `ref` for `HTMLInputElement` vs `HTMLTextAreaElement`.
*   **Global CSS (`menu.css`, `index.css`):** The new `ActionMenu` relies on global styles. Verify that no new component styles introduce specificity conflicts.
*   **`useEditorHotkeys.ts`:** This hook relies on the interaction state (`canvasInteractionAtom`). Its functionality should be re-verified as the components that set this state are being refactored.

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Positioning Complexity** | Medium | Medium | The element-relative positioning logic for the toolbar is complex. **Mitigation:** We will use a dedicated, battle-tested library (`@floating-ui/react-dom`) to handle all positioning, scrolling, and viewport collision logic, de-risking this implementation significantly. |
| **Performance Regression** | Low | High | The new renderers and hooks add layers of abstraction, which could impact performance during frequent re-renders like drag-and-drop. **Mitigation:** The pure "View" component inside each renderer will be wrapped in `React.memo`. This ensures that only direct changes to a component's data cause a visual re-render, while interaction state changes do not. |
| **Prop Drilling** | Medium | Medium | Passing editor-specific props like `isEditing` through the new renderers could become cumbersome. **Mitigation:** A React Context (`EditorContext`) will be scoped to the `EditorCanvas` to provide this state directly to the renderers *only when* `mode="canvas"`, keeping the preview path pure. (Note: Initial implementation will proceed without Context for simplicity, but it remains a viable mitigation if needed). |

## 9. Definition of Done

*   [ ] All new hooks (`useCanvasActions`, `useEditorInteractions`) and generic components (`ActionToolbar`, `ActionMenu`) are implemented and tested.
*   [ ] The entire `src/features/Editor/renderers` directory is implemented, and all components render correctly in both `'canvas'` and `'preview'` modes.
*   [ ] The old files (`CanvasWrappers.tsx`, `CanvasRenderers.tsx`, `SelectionToolbar.tsx`, `SelectionToolbarMenu.tsx`) and the `previews/` directory are completely removed from the codebase.
*   [ ] The single-selection toolbar appears correctly positioned above the selected element and is fully functional.
*   [ ] The multi-selection toolbar appears correctly at the bottom of the viewport and is fully functional.
*   [ ] `DndDragOverlay.tsx` and `FormRenderer.tsx` have been updated to use the new unified renderers.
*   [ ] All core editor functionality (DnD, selection, editing, undo/redo, hotkeys) is verified to work with no regressions.
*   [ ] The application builds without errors and all relevant tests pass.

---

## **File Changes Summary**

### New Files
*   **`src/components/ActionMenu.tsx`**: A new generic, data-driven component that renders a menu from an `items` array, using global `.menu-item` styles.
*   **`src/components/ActionToolbar.tsx`**: A new generic, presentational component for positioning floating toolbars using `@floating-ui/react-dom`.
*   **`src/components/ActionToolbar.module.css`**: Styles for the new `ActionToolbar`.
*   **`src/features/Editor/CanvasSelectionToolbar.tsx`**: The new "smart" orchestrator for the single-selection toolbar. It uses `useComponentCapabilities` and `useCanvasActions` to build and render the toolbar UI.
*   **`src/features/Editor/useCanvasActions.ts`**: A critical new hook that centralizes all canvas mutation logic (delete, wrap, etc.), providing a stable API for all UI components.
*   **`src/features/Editor/useEditorInteractions.ts`**: A critical new hook that encapsulates all common canvas interaction logic for a component (`useSortable`, selection handling), dramatically simplifying the new renderer components.
*   **`src/features/Editor/renderers/*`**: An entire new directory containing the unified renderers. Each file implements the `mode` prop contract, separating pure view logic from canvas interaction logic.
*   **`src/features/Editor/renderers/types.ts`**: A new file defining shared TypeScript types (`RenderMode`, `BaseRendererProps`) for the unified renderers.

### Modified Files
*   **`src/components/FormRenderer.tsx`**: Completely refactored to be a simple recursive component that calls the new unified renderers with `mode="preview"`.
*   **`src/App.tsx`**: Import paths for `PropertiesPanel` and `EditorCanvas` updated to reflect their new location in the flatter `Editor` directory.
*   **`src/features/ComponentBrowser/ComponentBrowser.tsx`**: Import path for `panel.module.css` corrected.
*   **`src/features/Editor/CanvasNode.tsx`**: Drastically simplified. Its role is now just a "router" that selects the correct unified renderer based on component type and passes `mode="canvas"`. All wrapper and editing logic has been removed.
*   **`src/features/Editor/CanvasUI.tsx`**: The `FloatingSelectionToolbar` is refactored to handle multi-selection only and now uses the generic `<ActionToolbar>` for its container and `useCanvasActions` for its logic.
*   **`src/features/Editor/DndDragOverlay.tsx`**: **Crucially updated** to import and use the new unified renderers (e.g., `<TextInputRenderer mode="preview" />`) instead of the old, deleted components from the `/previews` directory. This fulfills the "Single Source of Truth" goal.
*   **`src/features/Editor/EditorCanvas.tsx`**: No longer renders the single-selection toolbar (this is now handled by the renderers). Import paths updated.
*   **`src/features/Editor/PropertiesPanel.tsx`**: All import paths updated to reflect the new flattened directory structure.
*   **`src/features/Editor/PropertiesPanel/LayoutEditor.tsx`**: Import path for `canvasUtils` updated.