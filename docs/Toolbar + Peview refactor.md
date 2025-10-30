Of course. Based on the new context and the work already completed, here is the updated PRD. This document now accurately reflects the *remaining* work required to complete the architectural overhaul, treating the recent cleanups as the new baseline.

---

# PRD: Editor Architecture Refinements v2.0

| Version | Status     | Author      | Date         |
| :------ | :--------- | :---------- | :----------- |
| 2.0     | Proposed   | AI Assistant| 2023-10-28   |

## 1. Overview

### 1.1. Executive Summary
This document outlines the primary architectural refactoring for the Screen Studio editor. The goal is to dramatically increase code quality, reusability, and maintainability by resolving the remaining technical debt related to the editor's core rendering logic and selection UI. We will achieve this by abstracting the canvas-specific selection toolbars into a generic `ActionToolbar` system and, most critically, unifying the separate rendering paths for the editor and preview modes into a single source of truth. These changes will eliminate significant code duplication, prevent visual inconsistencies, and establish a robust, scalable foundation for future feature development.

## 2. Problem & Goals

### 2.1. Problem Statement
While recent preparatory cleanups have improved the codebase, the editor's core architecture still contains significant technical debt that hinders long-term velocity and maintainability:
1.  **Tightly Coupled Toolbars:** The `SelectionToolbar` and the multi-select toolbar in `CanvasUI.tsx` are tightly coupled to the canvas, preventing their common UI patterns from being easily reused elsewhere.
2.  **Critical Code Duplication:** The visual representation of components is defined in two separate, inconsistent places: `CanvasRenderers.tsx`/`previews` for the editor and `FormRenderer.tsx` for the final preview. This is a major source of bugs and visual drift between the editor and the final output.
3.  **Legacy Directory Structure:** The continued existence of files like `CanvasWrappers.tsx`, `CanvasRenderers.tsx`, and the `previews/` directory creates confusion and makes the codebase harder to navigate.

### 2.2. Goals
*   **Establish a Reusable UI Pattern:** Create a generic `ActionToolbar` component system that can be used for any selection-based actions across the application, adhering to the "Single Source of Truth" principle.
*   **Eliminate Code Duplication (DRY):** Eradicate the redundant component rendering logic by creating a single, unified rendering path.
*   **Guarantee Visual Consistency:** Ensure that a component rendered on the canvas is visually identical to its counterpart in the final preview and drag-overlay modes.
*   **Improve Codebase Health:** Finalize the editor's architecture by removing legacy files and clarifying component responsibilities, making the code easier to reason about, debug, and extend.

## 3. Scope & Key Initiatives

### 3.1. Key Initiatives
1.  **The Generic `ActionToolbar` System:** Abstract the existing selection toolbars into a generic, presentational `<ActionToolbar>` container and a data-driven `<ActionMenu>` component. Centralize all canvas action logic (delete, wrap, etc.) into a new `useCanvasActions` hook.
2.  **Unified Component Rendering:** Create a new set of unified renderer components in a dedicated `src/features/Editor/renderers/` directory. Each renderer will accept a `mode: 'canvas' | 'preview'` prop to control editor-specific chrome. All editor interaction logic (selection, sorting) will be encapsulated in a new `useEditorInteractions` hook consumed by these renderers.
3.  **Directory Structure Finalization:** Reorganize the `src/features/Editor/` directory, deleting all legacy files (`CanvasRenderers.tsx`, `CanvasWrappers.tsx`, `SelectionToolbar.tsx`, `previews/`, etc.) now made redundant by the new architecture.

### 3.2. Out of Scope
*   **New User-Facing Features:** This initiative is a purely architectural refactoring. No new functionality will be added for the end-user.
*   **`componentFactory.ts` or `canvasUtils.ts` Refactoring:** The recently created helper files are considered stable and will be used, not modified.
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
*   **`useCanvasActions`:** A new hook that accepts `selectedIds` and returns a memoized object of all possible canvas mutation functions (`handleDelete`, `handleWrap`, etc.). This hook will be the single place where `commitActionAtom` is called for canvas operations, serving as the "brain" for actions.
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
*   `CanvasNode.tsx` will be simplified into a "router" that selects the correct unified renderer and passes `mode="canvas"`.
*   `FormRenderer.tsx` will be refactored to recursively call the unified renderers in `"preview"` mode.
*   The old `CanvasWrappers.tsx`, `CanvasRenderers.tsx`, `SelectionToolbar.tsx`, `SelectionToolbarMenu.tsx`, and the entire `previews/` directory will be **deleted**.
*   The `src/features/editor` directory will be renamed to `src/features/Editor` and its contents flattened for better discoverability.

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
*   `[MODIFIED] PropertiesPanel/PropertiesPanel.tsx` (Path updates)
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
*   `src/data/componentFactory.ts`
*   `src/types.ts`
*   `src/features/Editor/useComponentCapabilities.ts`
*   `src/features/Editor/canvasUtils.ts`

## 7. Unintended Consequences Check
*   **`App.tsx`:** Imports from the `Editor` feature must be updated to reflect the new directory structure.
*   **`useEditable.ts`:** This hook uses generics. Ensure the new renderers correctly type the `ref` for `HTMLInputElement` vs `HTMLTextAreaElement`.
*   **Global CSS (`menu.css`, `index.css`):** The new `ActionMenu` relies on global styles. Verify that no new component styles introduce specificity conflicts.
*   **`useEditorHotkeys.ts`:** This hook relies on the `canvasInteractionAtom`. Its functionality must be re-verified as the components that set this state are being refactored.

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Positioning Complexity** | Medium | Medium | The element-relative positioning for the toolbar is complex. **Mitigation:** We will use a dedicated, battle-tested library (`@floating-ui/react-dom`) to handle all positioning, scrolling, and viewport collision logic, de-risking this implementation significantly. |
| **Performance Regression** | Low | High | The new renderers and hooks add layers of abstraction, which could impact performance during frequent re-renders like drag-and-drop. **Mitigation:** The pure "View" component inside each renderer will be wrapped in `React.memo`. This ensures that only direct changes to a component's data cause a visual re-render, while interaction state changes do not. |
| **Prop Drilling** | Medium | Medium | Passing editor-specific props like `isEditing` through the new renderers could become cumbersome. **Mitigation:** A React Context (`EditorContext`) will be scoped to the `EditorCanvas` to provide this state directly to the renderers *only when* `mode="canvas"`, keeping the preview path pure. (Note: Initial implementation will proceed without Context for simplicity, but it remains a viable mitigation if needed). |

## 9. Definition of Done

*   [ ] All new hooks (`useCanvasActions`, `useEditorInteractions`) and generic components (`ActionToolbar`, `ActionMenu`) are implemented and tested.
*   [ ] The entire `src/features/Editor/renderers` directory is implemented, and all components render correctly in both `'canvas'` and `'preview'` modes.
*   [ ] The legacy files (`CanvasWrappers.tsx`, `CanvasRenderers.tsx`, `SelectionToolbar.tsx`, `SelectionToolbarMenu.tsx`) and the `previews/` directory are **completely removed** from the codebase.
*   [ ] The single-selection toolbar appears correctly positioned above the selected element and is fully functional.
*   [ ] The multi-selection toolbar appears correctly at the bottom of the viewport and is fully functional.
*   [ ] `DndDragOverlay.tsx` and `FormRenderer.tsx` have been updated to use the new unified renderers.
*   [ ] All core editor functionality (DnD, selection, editing, undo/redo, hotkeys) is verified to work with no regressions.
*   [ ] The application builds without errors and all relevant tests pass.