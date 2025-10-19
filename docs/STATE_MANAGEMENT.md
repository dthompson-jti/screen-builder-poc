# State Management Guide

This document explains the state management architecture of Screen Studio. Understanding this architecture is crucial for adding new features or modifying existing behavior safely and efficiently.

## 1. Core Philosophy: Atomic State with Jotai

The project uses [Jotai](https://jotai.org/) as its state management library. Jotai follows an **atomic** state management model. Instead of a single, monolithic state object (like in Redux), the application's state is composed of many small, independent pieces of state called "atoms."

**Why Jotai was chosen:**

*   **Minimal Boilerplate:** Creating and using state is simple and concise.
*   **Automatic Optimization:** Components only re-render when the specific atoms they subscribe to are updated. This prevents the performance issues common in systems where the entire application re-renders on any state change.
*   **Excellent TypeScript Support:** Jotai is written in TypeScript and provides first-class type safety.
*   **Flexibility:** Jotai supports simple state, derived state, and asynchronous actions seamlessly.

## 2. The Two Tiers of State

The application's state is conceptually divided into two tiers, managed in separate files:

1.  **UI State (`src/data/atoms.ts`):** State that controls the user interface but not the core data of the form being built.
2.  **Core Application State (`src/data/historyAtoms.ts`):** The persistent, undoable state of the form itself.

### 2.1. UI State (`atoms.ts`)

This file is the "control panel" for the application's UI. It contains atoms that manage things like:

*   Which view is currently active (`appViewModeAtom`: 'editor', 'preview', or 'settings').
*   The visibility of panels (`isComponentBrowserVisibleAtom`, `isPropertiesPanelVisibleAtom`).
*   The state of UI controls (`activeToolbarTabAtom`, `componentSearchQueryAtom`).
*   The interactive state of the canvas. This is managed by a single source-of-truth atom, `canvasInteractionAtom`, which uses a discriminated union to prevent invalid states (e.g., selecting and editing at the same time).
*   Derived, read-only atoms like `selectedCanvasComponentIdsAtom` and `activelyEditingComponentIdAtom` provide convenient access for components that only need to read the interaction state.
*   The state of modals (`isDataBindingModalOpenAtom`).

These atoms are typically simple and are read from and written to directly by UI components.

```typescript
// Example: The single source of truth for canvas interaction state
export const canvasInteractionAtom = atom<CanvasInteractionState>({ mode: 'idle' });

// Usage in a component to change the state:
const setInteractionState = useSetAtom(canvasInteractionAtom);
setInteractionState({ mode: 'selecting', ids: ['component-123'] });
```

### 2.2. Core Application State & Undo/Redo (`historyAtoms.ts`)

This is the most critical state management file in the project. It manages the actual structure and content of the form being built and implements the entire undo/redo system.

**Key Concepts:**

1.  **The Reducer Pattern:** Instead of allowing components to modify the form state directly, this file implements a **reducer pattern**. All modifications must be dispatched as strongly-typed **actions**.
2.  **Immutability with Immer:** All state transformations use the [Immer](https://immerjs.github.io/immer/) library. This allows us to write simple, "mutating" code while Immer handles the complex task of producing a new, immutable state object behind the scenes.
3.  **The History Atom:** A single, private atom (`historyAtom`) stores the entire history of the form:
    ```typescript
    type HistoryData = {
      past: UndoableState[];
      present: UndoableState;
      future: UndoableState[];
    };
    ```
    Where `UndoableState` is a complete snapshot of the form's name and all its components.

#### How to Modify the Canvas: The `commitActionAtom`

**This is the single most important rule for developers:** To modify the canvas state, you **must** use the `commitActionAtom`. Never attempt to write to the `canvasComponentsByIdAtom` directly.

`commitActionAtom` is a "write-only" atom that acts as the central dispatcher for all mutations.

**Workflow:**

1.  **Define the Action:** Determine which `HistoryAction` from `historyAtoms.ts` corresponds to the change you want to make. For example, to add a component, you need the `COMPONENT_ADD` action type. To update the properties of a form field (like its label), you need the `COMPONENT_UPDATE_FORM_PROPERTIES` action.
2.  **Get the Dispatcher:** Use the `useSetAtom` hook in your component to get the `commitAction` function.
    ```typescript
    import { useSetAtom } from 'jotai';
    import { commitActionAtom } from '../data/historyAtoms';

    const commitAction = useSetAtom(commitActionAtom);
    ```
3.  **Dispatch the Action:** Call the function with an action object and a human-readable message for the undo/redo toast notification.

    ```typescript
    // Example from useCanvasDnd.ts
    commitAction({
      action: {
        type: 'COMPONENT_ADD',
        payload: {
          componentType: 'widget',
          name: 'New Text Input',
          parentId: 'root',
          index: 0,
        }
      },
      message: "Add 'New Text Input'" // This message appears in the "Undid: ..." toast
    });
    ```

By centralizing all mutations through this single atom, we ensure that:
*   Every change is a predictable, testable transformation.
*   Every change is automatically recorded in the undo/redo history.
*   The core application logic is decoupled from the UI components that trigger it.