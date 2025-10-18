Excellent. This is the final level of refinement needed. The feedback on scope and specific interaction details makes the plan much stronger.

Here is the revised, final plan, reflecting all the decisions from our red team exercise.

***

# Context Menu Feature: PRD, UX/UI Spec, & Architecture Plan (REVISED)

This document is the final plan for the V1 implementation of the canvas context menu. It has been updated based on a red team analysis and subsequent product decisions to prioritize core functionality and user feedback.

## 1. Product Requirements Document (PRD)

### 1.1. Overview

To enhance the efficiency and workflow for power users, we will introduce a context-aware right-click menu within the editor canvas. This menu will provide quick access to common component manipulation actions.

### 1.2. V1 Goal

The primary goal of V1 is to validate the core interaction model of the context menu and deliver a small set of high-value, fully functional actions. A secondary goal is to present non-functional ("dummy") actions to gather direct user feedback on which features to prioritize next.

### 1.3. User Stories (V1 Focus)

*   **As a user,** I want to right-click on any component to instantly select it and see a menu of possible actions, so my workflow is not interrupted.
*   **As a user,** when I have multiple items selected, I want to right-click on one of them without losing my selection, so I can confidently perform group actions.
*   **As an editor,** I want to quickly **Delete** a component or **Wrap** a component in a container using the right-click menu, as these are frequent and critical structural changes.
*   **As a user,** I want to see other potential actions (like Duplicate, Copy, Paste) in a disabled state, so I can understand what the tool might do in the future and provide feedback.

### 1.4. V1 Feature Scope

| Feature | V1 Status & Rationale |
| :--- | :--- |
| **Menu Activation** | ✅ **Functional.** Right-click and keyboard (`Shift+F10`) activation. |
| **Context Awareness** | ✅ **Functional.** Menu content will change for single vs. multi-select. |
| **Selection Logic** | ✅ **Functional.** Refined logic to protect existing multi-selections. |
| **Viewport Collision** | ✅ **Functional.** Menu will intelligently avoid rendering off-screen. |
| **Core Action: Delete** | ✅ **Functional.** High-frequency, destructive action that benefits from quick access. |
| **Core Action: Wrap in Container**| ✅ **Functional.** High-value structural action that is cumbersome without a shortcut. |
| **Core Action: Select Parent** | ✅ **Functional.** Simple to implement and already a common pattern in design tools. |
| **Core Action: Settings** | ✅ **Functional.** Simple to implement and reinforces the link between a component and its properties. |
| **Feedback Action: Duplicate** | 🟡 **Dummy (Disabled).** Included to gauge user interest in single-item duplication. |
| **Feedback Action: Copy/Paste** | 🟡 **Dummy (Disabled).** Included to gauge user interest in a more complex clipboard workflow. |
| **Feedback Action: Unwrap** | 🟡 **Dummy (Disabled).** Included to test the terminology and need for this feature. |
| **Feedback Action: Canvas Action**| 🟡 **Dummy (Disabled).** A menu item for right-clicking the empty canvas area to explore possibilities. |

## 2. UX/UI Specification

### 2.1. Core Interaction Model

1.  **Right-Clicking a Component:**
    *   **On an unselected component:** The existing selection is cleared, the clicked component becomes the new single selection, and the menu appears.
    *   **On a component within a multi-selection:** The multi-selection is **preserved**, and the menu for group actions appears.
2.  **Right-Clicking the Empty Canvas:**
    *   The current selection is cleared.
    *   A unique, minimal context menu appears at the cursor's location.
3.  **Keyboard Activation (`Shift+F10` / Menu Key):**
    *   Opens the context menu for the currently selected component(s).

### 2.2. Visual Design

The menu will be built with Radix UI and styled to match `menu.css`, ensuring visual consistency. Disabled items will use the standard `:disabled` opacity, clearly indicating they are not interactive.

### 2.3. Menu Content & Logic (V1)

#### 2.3.1. Single Component Selected

| Action | V1 Status | Notes |
| :--- | :--- | :--- |
| **Duplicate** | 🟡 **Disabled** | |
| **Copy** | 🟡 **Disabled** | |
| **Paste** | 🟡 **Disabled** | Enabled only if the (dummy) clipboard has an item. |
| `---` | *Divider* | |
| **Select Parent** | ✅ **Enabled** | Disabled if the component is the root. |
| **Wrap in Container** | ✅ **Enabled** | Disabled if the component is the root. |
| **Unwrap Container** | 🟡 **Disabled** | Visible only if the component is a Layout Container. |
| `---` | *Divider* | |
| **Delete** | ✅ **Enabled** | Disabled if the component is the root. |
| **Settings** | ✅ **Enabled** | |

#### 2.3.2. Multiple Components Selected

| Action | V1 Status | Notes |
| :--- | :--- | :--- |
| **Duplicate [#] Items** | 🟡 **Disabled** | |
| **Copy [#] Items** | 🟡 **Disabled** | |
| `---` | *Divider* | |
| **Wrap in Container** | ✅ **Enabled** | Enabled if all items share the same parent. |
| `---` | *Divider* | |
| **Delete [#] Items** | ✅ **Enabled** | |

#### 2.3.3. Empty Canvas Right-Clicked

| Action | V1 Status | Notes |
| :--- | :--- | :--- |
| **What could go here?** | 🟡 **Disabled** | A placeholder to solicit feedback on canvas-level actions. |
| **Paste** | 🟡 **Disabled** | Enabled only if the (dummy) clipboard has an item. |

## 3. Architecture & Development Plan

### 3.1. State Management (Jotai)

The state management plan is simplified for V1.

```typescript
// src/data/atoms.ts

interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  // Target can be a component ID, or 'root' for the canvas background
  targetId: string | 'root' | null;
}

// Manages the context menu's visibility and position
export const contextMenuStateAtom = atom<ContextMenuState>({ /*...*/ });

// A dummy atom for the clipboard to enable/disable the Paste menu item
export const dummyClipboardAtom = atom<boolean>(false);
```

### 3.2. Component Structure

*   **`src/components/CanvasContextMenu.tsx` (NEW):**
    *   Will be rendered via a React Portal from `App.tsx`.
    *   Uses Radix UI's `ContextMenu` primitive with `collisionPadding` to prevent off-screen rendering.
    *   Contains the complete logic to render the correct menu (single-select, multi-select, or canvas) based on `contextMenuStateAtom` and `selectedCanvasComponentIdsAtom`.

### 3.3. Event Handling

*   **`src/views/EditorCanvas.tsx`:**
    *   The `onContextMenu` and `onKeyDown` handlers will be attached to the outermost canvas container (`div.canvasContainer`).
    *   The handler will check the event target. If a `data-id` is found, `targetId` in the atom is set to that ID. If not, `targetId` is set to `'root'`. This correctly distinguishes between a component click and a canvas click.

### 3.4. Action & History Management (Immer)

The V1 scope requires no new action types in `historyAtoms.ts`. All functional actions can be implemented with existing logic.

*   **`'COMPONENTS_DELETE_BULK'`:** Used by the "Delete" action.
*   **`'COMPONENTS_WRAP'`:** Used by the "Wrap in Container" action.
*   **`selectedCanvasComponentIdsAtom`:** The "Select Parent" action will simply `set` this atom to the parent's ID.
*   **`isPropertiesPanelVisibleAtom`:** The "Settings" action will `set` this atom to `true`.

### 3.5. Phased Implementation Plan (V1)

1.  **Foundation:**
    *   Implement the `contextMenuStateAtom`.
    *   Create the `<CanvasContextMenu />` component shell.
    *   Implement the `onContextMenu` and `onKeyDown` handlers in `EditorCanvas.tsx` to correctly open the menu and differentiate between component and canvas targets.
2.  **Core Actions:**
    *   Build the menu generation logic for the single-selection context.
    *   Wire up the **Delete**, **Wrap in Container**, **Select Parent**, and **Settings** actions.
3.  **Dummy Actions & Multi-Select:**
    *   Add the disabled menu items using the `:disabled` state.
    *   Implement the logic branch for rendering the multi-selection menu and the canvas menu.
4.  **Polish & Test:**
    *   Ensure Radix UI collision detection is working correctly.
    *   Test all selection logic edge cases (especially the refined multi-select behavior).
    *   Verify accessibility with keyboard navigation.