# discovery-plan-architecture-perf.md

## 1. Introduction

This document outlines the discovery and implementation plan for key architectural improvements focused on enhancing application performance and maintainability. The core of this plan is to transition from a coarse-grained state subscription model (where components listen to the entire component tree) to a fine-grained model, ensuring that UI updates are surgical and efficient.

## 2. Goals

-   **Primary Goal:** Measurably improve the application's render performance by minimizing the number of component re-renders during state updates.
-   Eliminate duplicated code by centralizing the `getComponentName` utility.
-   Improve code robustness by replacing "magic string" IDs with shared constants.

## 3. Scope

### In Scope

-   Profiling the current render behavior of the `EditorCanvas`.
-   Implementing and integrating a "selector" atom pattern for per-component state subscription.
-   Refactoring `CanvasNode.tsx` to use the new pattern.
-   Consolidating all `getComponentName` logic into a single utility function.
-   Creating and integrating a `constants.ts` file for shared IDs like `root` and the canvas background.

### Out of Scope

-   Performance optimizations outside of the Jotai state/React render lifecycle (e.g., network, asset loading).
-   Large-scale refactoring of components other than `CanvasNode` and its direct dependencies.

## 4. Key Questions to Answer

1.  What is the baseline performance? Using the React Profiler, how many components re-render when a single component's label is changed?
2.  What is the performance gain after implementing the selector atom pattern? How does the new profiler output compare to the baseline?
3.  How many files are currently re-implementing the `getComponentName` logic?
4.  What other hardcoded string literals exist in the codebase that would be better suited as constants?

## 5. Proposed Tasks & Spikes

1.  **Spike: Baseline Performance Profile (1 hour)**
    -   Using the React DevTools Profiler, record a profiling session.
    -   Perform a simple action that causes a state update (e.g., select a text input and change its label via the properties panel).
    -   Analyze the flamegraph to count how many `CanvasNode` and `ComponentRenderer` instances re-render. Take a screenshot for comparison.

2.  **Task: Implement Granular State Atoms (2 hours)**
    -   In `historyAtoms.ts`, create the selector atom: `export const componentAtom = (id: string) => atom((get) => get(canvasComponentsByIdAtom)[id]);`.
    -   In `CanvasNode.tsx`, change its state consumption from `useAtomValue(canvasComponentsByIdAtom)` to `const component = useAtomValue(componentAtom(componentId));`.
    -   This will require passing the `allComponents` map down to child components that still need it (like `ContainerPreview` in the drag overlay), or refactoring them to use the new pattern as well.

3.  **Spike: Post-Refactor Performance Profile (1 hour)**
    -   Repeat the exact same action from the baseline spike.
    -   Analyze the new flamegraph and compare it to the baseline screenshot. The number of re-rendered `CanvasNode` components should be drastically lower (ideally, only the one that was edited). Document the improvement.

4.  **Task: Consolidate Utilities (1 hour)**
    -   Create `src/features/Editor/utils/canvasUtils.ts`.
    -   Move the `getComponentName` logic into this file.
    -   Search the codebase for other implementations and replace them with an import from the new utility file.

5.  **Task: Implement Constants (1 hour)**
    -   Create `src/data/constants.ts`.
    -   Add `export const ROOT_ID = 'root';` and `export const CANVAS_BACKGROUND_ID = '--canvas-background--';`.
    -   Search the codebase for these strings and replace them with imports of the new constants.

## 6. Success Criteria

-   Profiler data clearly shows a significant reduction (e.g., >80%) in unnecessary re-renders for a targeted state update.
-   The `getComponentName` function exists in only one place.
-   Hardcoded IDs for `root` and the canvas background have been eliminated from the application logic.