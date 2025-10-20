# discovery-plan-code-vetting.md

## 1. Introduction

This document outlines the plan to investigate and harden three critical, high-complexity areas of the application's logic: the drag-and-drop targeting function (`getDropTarget`), the core state reducer (`commitActionAtom`), and the drag overlay rendering logic (`renderDragOverlay`). The goal is to improve their robustness, reduce the likelihood of future bugs, and increase developer confidence when modifying this core code.

## 2. Goals

-   Verify and validate the logic of the `getDropTarget` function against various edge cases.
-   Improve the scalability of the `renderDragOverlay` function.
-   Enhance the robustness of the `fieldName` sanitization logic within the `commitActionAtom` reducer.

## 3. Scope

### In Scope

-   Analysis and refactoring of `useCanvasDnd.ts` -> `getDropTarget()`.
-   Analysis and refactoring of `App.tsx` -> `renderDragOverlay()`.
-   Analysis of the reducer logic in `historyAtoms.ts`, specifically focusing on `COMPONENT_ADD` and `COMPONENT_UPDATE_FORM_PROPERTIES` actions.

### Out of Scope

-   Implementing a formal testing framework (e.g., Vitest). This plan focuses on targeted code improvements and manual validation.
-   Vetting or refactoring `navigator.js`.

## 4. Key Questions to Answer

1.  **`getDropTarget`:** Does the function correctly calculate drop indexes for nested containers? How does it behave with different `gap` and `padding` settings on a layout container? Does it handle empty containers correctly?
2.  **`renderDragOverlay`:** How can we refactor the `if`/`switch` statement to a more declarative pattern (e.g., a map) that is easier to extend with new component types?
3.  **Reducer Logic:** How can the `sanitizeLabelToFieldName` logic be improved to handle edge cases (e.g., special characters, duplicate labels) more gracefully? Should this logic be extracted into a dedicated utility function?

## 5. Proposed Tasks & Spikes

1.  **Spike: `getDropTarget` Validation (2-3 hours)**
    -   Create a temporary test page or component that calls `getDropTarget` with a variety of hardcoded `over`, `draggingRect`, and `allComponents` mock objects.
    -   Log the output for different scenarios: dropping on empty containers, dropping at the start/end of a list, dropping between items in a grid.
    -   Document any identified bugs or incorrect calculations.

2.  **Task: Refactor `renderDragOverlay` (1-2 hours)**
    -   Create a configuration object (a map) that associates a `controlType` or `componentType` with its corresponding preview component.
    -   Rewrite the `renderDragOverlay` function to use this map for a simple lookup, removing the nested conditional logic.

3.  **Task: Refactor `fieldName` Sanitization (1-2 hours)**
    -   Extract the `sanitizeLabelToFieldName` logic from `PropertiesPanel.tsx` and the `COMPONENT_ADD` action into a single, robust utility function in `src/features/Editor/utils/canvasUtils.ts`.
    -   Improve the function to handle more edge cases (e.g., leading numbers, non-alphanumeric characters).
    -   Update the `PropertiesPanel` and `historyAtoms` reducer to use this new, centralized function.

## 6. Success Criteria

-   The `getDropTarget` function's behavior is documented and confirmed to be correct for key scenarios.
-   The `renderDragOverlay` function is refactored to a declarative map, and adding a new preview component requires only one line of code to be added to the map.
-   The logic for converting a component's label to a field name is centralized in a single utility function.