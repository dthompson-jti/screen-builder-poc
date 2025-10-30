# Main Refactoring & Cleanup Plan

This document outlines the approved, high-priority tasks for improving the project's architecture, component system, and overall code hygiene.

### 1. Architectural Refinements

1.  **Consolidate All Global Hotkey Logic**
    *   **Analysis:** Global undo/redo keyboard shortcuts are defined in `App.tsx`, while other editor hotkeys (delete, wrap, etc.) are in the `useEditorHotkeys.ts` hook. This splits responsibility for handling global keyboard input.
    *   **Proposal:** Move the undo/redo `useEffect` logic from `App.tsx` into the `useEditorHotkeys.ts` hook. Call this unified hook once in `App.tsx`.
    *   **Rationale:** Centralizes all non-input-related global hotkey logic into a single hook, making the system more predictable and adhering to the "Single Source of Truth" principle for keyboard interactions.

2.  **Encapsulate Drag Overlay Rendering Logic**
    *   **Analysis:** `App.tsx` contains a large, multi-conditional function `renderDragOverlay()` that handles the visual presentation of all draggable items.
    *   **Proposal:** Create a new, dedicated component: `src/features/Editor/DndDragOverlay.tsx`. This component will receive the `activeDndItem` as a prop and contain all the conditional rendering logic. `App.tsx` will then render `<DndDragOverlay activeItem={activeDndItem} />`.
    *   **Rationale:** Cleans up `App.tsx`, making it a pure orchestrator. It encapsulates complex presentation logic into a focused component, improving separation of concerns.

3.  **Scope Data-Binding Modal State**
    *   **Analysis:** The state for the data-binding modal (`modalPendingSelectionAtom`, `modalSelectedNodeIdAtom`, etc.) is currently defined in the global `src/data/atoms.ts` but is only ever used when the modal is open.
    *   **Proposal:** Move the modal-specific atoms out of the global scope. Define them as local `useState` hooks within `DataBindingModal.tsx` for managing its internal state like pending selections and search queries.
    *   **Rationale:** Reduces the global state surface area, making the application easier to reason about. Scoping state to the component that owns it aligns with Jotai's philosophy of minimal, atomic state.

### 2. Component System Enhancements

1.  **Refactor `HeaderMenu` to Use Radix `DropdownMenu` Primitives**
    *   **Analysis:** `HeaderMenu.tsx` manually manages its state with `useOnClickOutside`, while its trigger in `AppHeader.tsx` is already a Radix `DropdownMenu.Trigger`. This re-implements functionality that Radix provides.
    *   **Proposal:** Convert `HeaderMenu.tsx` to be a `DropdownMenu.Content` component. The `DropdownMenu.Root` and `Trigger` in `AppHeader.tsx` will then control its visibility automatically. Replace custom button elements with `DropdownMenu.Item` and `DropdownMenu.CheckboxItem` for better accessibility and state handling.
    *   **Rationale:** Simplifies code, removes unnecessary hooks, improves accessibility (keyboard navigation, focus management), and guarantees consistency with all other dropdowns in the application.

2.  **Unify `Toggle` and `Button` Components**
    *   **Analysis:** The `Toggle` component (`Toggle.tsx`, `toggle.css`) is visually and functionally identical to a tertiary `Button`. The CSS in `toggle.css` is a near-perfect copy of the `[data-variant="tertiary"]` styles in `buttons.css`, violating the Single Source of Truth principle.
    *   **Proposal:** Delete `src/styles/toggle.css`. Refactor `Toggle.tsx` to leverage the `Button` component as a child (`asChild`). Components using the toggle can now be implemented as `<RadixToggle.Root asChild><Button variant="tertiary">...</Button></RadixToggle.Root>`.
    *   **Rationale:** This critical cleanup removes redundant CSS, ensures visual consistency, and simplifies the component system by recognizing that a toggle is a specialized button.

### 3. Code Hygiene

1.  **Fix `navigator.d.ts` Module Declaration**
    *   **Analysis:** The TypeScript declaration file for `navigator.js` is missing `export {}`, which can prevent TypeScript from treating it as a module.
    *   **Proposal:** Add `export {};` to the end of the `navigator.d.ts` file.
    *   **Rationale:** Ensures the declaration file is correctly interpreted as an ES module, providing reliable type safety for the `NodeNavigator` class.