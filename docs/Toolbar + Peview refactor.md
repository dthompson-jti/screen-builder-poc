Of course. Here is the fully updated and consolidated plan. It incorporates the decisions for a flatter directory structure and confirms the value of the generic `ActionToolbar`.

This version adds a new section on **Potential Risks and Mitigations** to address overlooked aspects and unintended consequences, making the plan more robust.

---

# PRD & Technical Specification: Editor Architecture Refinements v2.0

| Version | Status     | Author      | Date         |
| :------ | :--------- | :---------- | :----------- |
| 2.0     | Finalized  | AI Assistant | 2023-10-27   |

## Table of Contents

1.  [**Overview**](#1-overview)
    *   [1.1. Executive Summary](#11-executive-summary)
    *   [1.2. Guiding Principles](#12-guiding-principles)
2.  [**Product Requirements Document (PRD)**](#2-product-requirements-document-prd)
    *   [2.1. Problem Statement](#21-problem-statement)
    *   [2.2. Goals & Objectives](#22-goals--objectives)
    *   [2.3. Key Initiatives](#23-key-initiatives)
    *   [2.4. Out of Scope](#24-out-of-scope)
3.  [**UX/UI Specification**](#3-uxui-specification)
    *   [3.1. Initiative 1: The `ActionToolbar` System](#31-initiative-1-the-actiontoolbar-system)
    *   [3.2. Initiative 2: Unified Rendering Consistency](#32-initiative-2-unified-rendering-consistency)
4.  [**Architecture & Implementation Plan**](#4-architecture--implementation-plan)
    *   [4.1. Initiative 1: The Generic `ActionToolbar` System](#41-initiative-1-the-generic-actiontoolbar-system)
    *   [4.2. Initiative 2: Unified Component Rendering](#42-initiative-2-unified-component-rendering)
    *   [4.3. Initiative 3: Directory Structure Refinement](#43-initiative-3-directory-structure-refinement)
5.  [**Potential Risks and Mitigations**](#5-potential-risks-and-mitigations)
6.  [**Phased Rollout & Definition of Done**](#6-phased-rollout--definition-of-done)

---

## 1. Overview

### 1.1. Executive Summary

This document outlines a series of architectural refinements for the Screen Studio editor. The primary goal is to increase code quality, reusability, and maintainability by addressing key areas of tight coupling and code duplication. We will achieve this by undertaking three core initiatives:

1.  **Generalize the Selection Toolbar:** Abstract the canvas-specific selection toolbar into a generic, reusable `ActionToolbar` system. This is a strategic investment in the project's UI component library, ensuring consistency for its two planned use cases (Canvas, Data Navigator) and any future needs.
2.  **Unify Component Rendering:** Consolidate the separate rendering paths for the editor canvas and the final form preview into a single, authoritative source of truth. This eliminates a significant source of technical debt and potential visual bugs.
3.  **Refine Directory Structure:** Reorganize the `editor` feature directory into a flatter, more pragmatic structure to improve code discoverability and reduce cognitive overhead.

These changes will strengthen the codebase, making it easier to maintain and extend, while ensuring a more consistent and robust user experience.

### 1.2. Guiding Principles

This plan is written in accordance with the project's established principles as defined in `README.md` and `CSS-PRINCIPLES.md`. All work will adhere to:

*   **Single Source of Truth:** Eliminating duplication in both logic and styling.
*   **State-Driven Appearance:** Ensuring UI is a direct, predictable reflection of state.
*   **High-Craft Transitions & Details:** Maintaining a polished and professional user experience.
*   **Systematic CSS Architecture:** Leveraging the existing layered CSS system and conventions.

---

## 2. Product Requirements Document (PRD)

### 2.1. Problem Statement

The editor's architecture, while functional, has developed several technical debts that hinder long-term velocity and maintainability:

1.  **Component-Specific Toolbar:** The `SelectionToolbar` is tightly coupled to the canvas, preventing its UI pattern from being easily reused in other parts of the application.
2.  **Dual Rendering Logic:** The visual representation of form components is defined in two separate places (`CanvasRenderers.tsx`/`previews` and `FormRenderer.tsx`). This leads to code duplication and creates a risk of visual inconsistency between the editor and the final preview.
3.  **Suboptimal Directory Structure:** The current `src/features/Editor/` directory structure could be flatter and more intuitive, improving developer experience.

### 2.2. Goals & Objectives

*   **Establish a Reusable Pattern:** Create a generic `ActionToolbar` component system that can be used for any selection-based actions across the application.
*   **Reduce Code Duplication:** Eliminate the redundant component rendering logic by creating a single, unified rendering path.
*   **Improve Maintainability:** Make the codebase easier to reason about, debug, and extend by clarifying the directory structure and component responsibilities.
*   **Guarantee Visual Consistency:** Ensure that a component rendered on the canvas is visually identical to its counterpart in the final preview mode.

### 2.3. Key Initiatives

1.  **The `ActionToolbar` System:**
    *   Create a generic, presentational `<ActionToolbar>` container component.
    *   Create a generic, data-driven `<ActionMenu>` component for use in popovers.
    *   Refactor the existing canvas toolbar to be a "smart" orchestrator that uses these new generic components.
2.  **Unified Component Rendering:**
    *   Create a new set of unified renderer components in a dedicated directory.
    *   Each renderer will accept a `mode: 'canvas' | 'preview'` prop to control editor-specific chrome.
    *   Refactor `EditorCanvas.tsx` and `FormRenderer.tsx` to use this new unified system.
    *   Delete the old, duplicated rendering files.
3.  **Directory Structure Refinement:**
    *   Reorganize the `src/features/editor/` directory into a flatter structure with a single `renderers/` subdirectory.

### 2.4. Out of Scope

*   **New User-Facing Features:** This initiative is a purely architectural refactoring. No new functionality will be added for the end-user.
*   **Formal Command Pattern:** The existing `commitActionAtom` reducer pattern is sufficient and will not be replaced with a more complex command system.
*   **Non-Selection Toolbars:** The initial scope for the `ActionToolbar` is to support selection-based contexts only.

---

## 3. UX/UI Specification

### 3.1. Initiative 1: The `ActionToolbar` System

#### Visual Specification

| Element           | Description                                                                                                                                                                                              |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Toolbar Container** | A floating element with `background-color: var(--surface-bg-brand-solid)`, `border-radius: var(--spacing-2)`, `padding: var(--spacing-1)`, and `box-shadow: var(--surface-shadow-lg)`.                      |
| **Toolbar Items**   | All buttons within the toolbar will use the `Button` component with `variant="on-solid"` and `size="s"`.                                                                                                   |
| **Dividers**        | A `1px` vertical divider with `background-color: var(--surface-border-tertiary)` and `opacity: 0.5` will be used to group items, matching the existing toolbar style.                                         |
| **Menu Popover**    | The dropdown menu triggered from the toolbar will use the global `.menu-popover` class for its container styling.                                                                                          |
| **Menu Items**      | All items within the dropdown menu will use the global `.menu-item` class, ensuring they are visually identical to all other menus in the application (e.g., `Select`, `ContextMenu`).                      |

#### Interaction Specification

*   **Positioning:**
    *   **Element-Relative:** For single-item selection, the toolbar will appear centered above the selected element's bounding box with a `44px` offset. It will track the element's position on screen.
    *   **Fixed:** For multi-item selection, the toolbar will appear at a fixed position: `bottom: 24px`, centered horizontally.
*   **Appearance:** The toolbar will fade in smoothly when `isVisible` becomes true.
*   **Focus Management:** When the menu popover is opened, focus will be managed by the underlying Radix UI primitive. Upon closing, focus should return gracefully to the trigger element.

### 3.2. Initiative 2: Unified Rendering Consistency

*   **Visual Parity:** Components rendered with `mode="canvas"` must be pixel-perfect identical to those rendered with `mode="preview"`, with the sole exception of editor-specific UI chrome (e.g., selection outlines, toolbars, empty state text).
*   **State Reflection:** All property changes made in the `PropertiesPanel` must be reflected identically and instantly in both the canvas and preview modes.

---

## 4. Architecture & Implementation Plan

### 4.1. Initiative 1: The Generic `ActionToolbar` System

#### New Generic Components (`src/components/`)

**1. `ActionToolbar.tsx`**
This component is the presentational container. Its primary responsibility is appearance and positioning.

```typescript
// src/components/ActionToolbar.tsx
interface ActionToolbarProps {
  children: React.ReactNode;
  isVisible: boolean;
  positioning:
    // For the multi-select toolbar
    | { type: 'fixed'; bottom?: number; top?: number }
    // For the single-select, element-bound toolbar
    | { type: 'element'; targetRef: React.RefObject<HTMLElement>; offset?: number };
}
```

**2. `ActionMenu.tsx`**
This component renders a menu from a data structure, ensuring consistency with the global `.menu-item` style.

```typescript
// src/components/ActionMenu.tsx
type ActionItem =
  | {
      type: 'item';
      id: string;
      label: string;
      icon: string;
      onSelect: () => void;
      hotkey?: string;
      disabled?: boolean;
      destructive?: boolean;
    }
  | { type: 'separator' };

interface ActionMenuProps {
  items: ActionItem[];
}
```

#### Refactoring Path

1.  **Create Generic Components:** Implement `<ActionToolbar />` and `<ActionMenu />` in `src/components/` as pure, presentational components.
2.  **Create Canvas Orchestrator:** Create `src/features/editor/CanvasSelectionToolbar.tsx`. This component is the "brain" that connects the generic UI to the canvas state.
    *   It will read `selectedCanvasComponentIdsAtom`.
    *   It will use `useComponentCapabilities` to determine available actions.
    *   It will define all `onSelect` handlers (e.g., `handleDelete`, `handleWrap`) which dispatch actions via `commitActionAtom`.
    *   It will construct the `ActionItem[]` array, implementing the "Intelligent Disclosure" logic (hiding impossible actions, disabling unavailable ones).
3.  **Integrate:** The `SelectionWrapper` in `CanvasWrappers.tsx` will be updated to render `<CanvasSelectionToolbar />` when a single component is selected. The `FloatingSelectionToolbar` will be refactored to use the new `<ActionToolbar>` for its container.
4.  **Cleanup:** Delete the old `SelectionToolbar.tsx` and `SelectionToolbarMenu.tsx`.

### 4.2. Initiative 2: Unified Component Rendering

#### The `mode` Prop Contract

A single `mode` prop will dictate the rendering context.

```typescript
type RenderMode = 'canvas' | 'preview';

interface BaseRendererProps<T extends CanvasComponent> {
  component: T;
  mode: RenderMode;
}
```

#### New Renderer Component Structure (Example)

```typescript
// src/features/editor/renderers/TextInputRenderer.tsx

// A pure, memoizable view component. No editor logic.
const TextInputView = React.memo(({ component }) => { /* ... */ });

export const TextInputRenderer = ({ component, mode }: BaseRendererProps<FormComponent>) => {
  if (mode === 'canvas') {
    // Canvas mode adds the interactive layers
    return (
      <SortableWrapper component={component}>
        <SelectionWrapper component={component}>
          <TextInputView component={component} />
        </SelectionWrapper>
      </SortableWrapper>
    );
  }
  // Preview mode returns the pure view
  return <TextInputView component={component} />;
};
```

#### Migration Plan

1.  **Create Directory:** Create the new directory `src/features/editor/renderers/`.
2.  **Implement New Renderers:** Create a new renderer file for each component type (e.g., `LayoutRenderer.tsx`). Port the visual logic from the existing `previews/*.tsx` and `CanvasRenderers.tsx` files into the `...View` part of the new components.
3.  **Refactor `CanvasNode.tsx`:** Update the recursive `CanvasNode` to import and use the new unified renderers, passing `mode="canvas"`.
4.  **Refactor `FormRenderer.tsx`:** Drastically simplify `FormRenderer.tsx` to be a recursive component that imports and uses the same unified renderers, passing `mode="preview"`.
5.  **Cleanup:** Once all logic is migrated, safely delete the following:
    *   `src/features/Editor/CanvasRenderers.tsx`
    *   `src/features/Editor/previews/` (the entire directory)

### 4.3. Initiative 3: Directory Structure Refinement

The `src/features/editor/` directory will be reorganized to the following flatter structure:

```
/src/features/editor/
├── EditorCanvas.tsx             # Core canvas component
├── PropertiesPanel.tsx          # Core properties panel component
├── MainToolbar.tsx              # The main vertical toolbar on the left
├── CanvasSelectionToolbar.tsx   # The new "smart" orchestrator for selection
├── useComponentCapabilities.ts  # The centralized logic hook for actions
│
└── renderers/                   # The ONLY subdirectory for this feature
    ├── LayoutRenderer.tsx
    ├── TextInputRenderer.tsx
    └── ... (all other unified renderers)
```

---

## 5. Potential Risks and Mitigations

| Risk                                                                                                        | Likelihood | Impact | Mitigation Strategy                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| :---------------------------------------------------------------------------------------------------------- | :--------- | :----- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Complex Prop Drilling:** The unified renderers might require a large number of editor-specific props (e.g., `isEditing`, `editableProps`). Passing these down through `mode="canvas"` could become cumbersome. | Medium     | Medium | We will use a React Context (`EditorContext`) scoped to the `EditorCanvas` to provide editor-specific state (like the current interaction mode) to the renderers. This avoids prop drilling. The renderer components will consume this context *only* when `mode="canvas"`, keeping the `mode="preview"` path completely pure and context-free.                                                                                                                                                                                                                                                        |
| **Performance Regression in Drag-and-Drop:** The unified renderers introduce an extra layer of logic. This could potentially slow down the frequent re-renders that occur during a drag operation.                 | Low        | High   | The core "view" part of each renderer (e.g., `TextInputView`) will be wrapped in `React.memo`. Since the `component` prop is the only thing that changes, this will prevent unnecessary re-renders. We will also perform targeted performance profiling during and after the refactor, specifically focusing on the drag-over experience, to ensure there is no degradation.                                                                                                                                                                                                                   |
| **Unforeseen Edge Cases in Positioning:** The generic `ActionToolbar`'s element-relative positioning logic must account for canvas scrolling, zooming (if ever added), and elements near the viewport edge.      | Medium     | Medium | The positioning logic will be implemented in a dedicated custom hook (`useElementPositioning`). This hook will use `getBoundingClientRect` and will listen for `scroll` and `resize` events to update its position. We will initially use a robust, well-maintained third-party library like `floating-ui` (the successor to Popper.js) to handle this complex logic, which is its core competency. This de-risks the implementation significantly.                                                                                                                                      |
| **Scope Creep during Refactoring:** While refactoring, there may be a temptation to "fix" or "improve" other unrelated parts of the code, delaying the primary objectives.                                       | Medium     | High   | This refactor will be executed via a series of small, targeted pull requests, each focused on a single, well-defined step (e.g., "1. Implement generic ActionToolbar", "2. Implement LayoutRenderer", etc.). Each PR must strictly adhere to the scope of its step. Any unrelated improvements will be noted and deferred to a separate task.                                                                                                                                                                                                                                         |

---

## 6. Phased Rollout & Definition of Done

This refactor will be implemented in phases to minimize risk and allow for continuous integration.

1.  **Phase 1: Toolbar Abstraction:**
    *   Implement the generic `<ActionToolbar>` and `<ActionMenu>` components.
    *   Implement the `CanvasSelectionToolbar` orchestrator.
    *   Integrate and replace the old toolbar system.
2.  **Phase 2: Unified Rendering Migration:**
    *   Create the `renderers/` directory and the `EditorContext`.
    *   Migrate one component type at a time (e.g., start with `LayoutRenderer`, then `TextInputRenderer`).
    *   For each component, update `CanvasNode` and `FormRenderer` to use it.
    *   Once all components are migrated, perform the final cleanup of old files.
3.  **Phase 3: Directory Reorganization:**
    *   Move the top-level files to their new locations in the flatter structure.

The entire project is considered **Done** when all three phases are complete and:

*   All generic and orchestrator components are implemented as specified.
*   All old, duplicated rendering and toolbar files are deleted from the codebase.
*   The `src/features/editor/` directory matches the new, flatter structure.
*   All existing functionality (selection, editing, DnD, undo/redo, preview mode) works as before, with no regressions.
*   The application builds without errors and all relevant tests pass.