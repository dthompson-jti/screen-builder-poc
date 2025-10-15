Of course. It's crucial to keep the specification document aligned with the reality of the implementation, especially after a series of iterative fixes. The "finicky" behavior has been addressed by evolving the interaction model, and the PRD must reflect this new, higher-quality standard.

Here is the fully updated PRD & UX Spec, incorporating all the changes and learnings from our development process.

---

# PRD & UX Spec: Smart Layout Container v1.2

*   **Document Version:** 1.2
*   **Date:** November 3, 2023
*   **Author:** [Your Name/Team]
*   **Status:** **Updated with Implemented DND Model**

## Document History / Change Log

*   **v1.2 (Current):**
    *   Updated Canvas Interaction (Sec 6.3) to specify the new, unified drag-and-drop feedback model (Container Glow + Predictive Line Indicator).
    *   Removed the concept of a separate "bottom drop zone" in favor of the more intuitive line indicator.
    *   Updated Technical Requirements (Sec 7) to reflect the implemented architecture, including the centralized `DndData` contract, state-aware drop logic, and use of global state atoms for DND feedback.
*   **v1.1:** Initial version with Red Team feedback.

## 1. Introduction & Vision

This document outlines the requirements and user experience for a new **Smart Layout Container** component in Screen Studio. The current screen builder is limited to a simple, single-column layout or a rigid, legacy "two-column" mode. This prevents users from creating modern, responsive, and complex user interfaces.

The vision is to replace the legacy system with a single, powerful, and intuitive `Layout Container` component. This will empower users to build flexible layouts through simple, intent-based controls, while automatically handling legacy screen migration. It will simplify complexity by providing intelligent defaults and guardrails, making layout design fast, consistent, and accessible without requiring deep knowledge of CSS.

## 2. Problem Statement

*   **Legacy Rigidity:** The existing "two-column" setting is a global page property, offering no flexibility for mixed layouts (e.g., a full-width header above a two-column section).
*   **Lack of Modern Tools:** Users cannot create common UI patterns like horizontal button groups, wrapping card grids, or nested content sections.
*   **Inconsistent User Experience:** The process for building a one-column vs. two-column screen is fundamentally different, increasing the learning curve.
*   **Technical Debt:** Maintaining a separate rendering path for legacy screens is inefficient and hinders future development.

## 3. Goals & Objectives

### Goals
1.  **Empower Users:** Enable non-technical users to create modern, responsive layouts with ease.
2.  **Unify the System:** Create a single, consistent component model for all screens, new and old.
3.  **Simplify Complexity:** Abstract away complex CSS concepts into simple, intent-based UI controls.
4.  **Ensure Backward Compatibility:** Seamlessly migrate existing legacy screens to the new system without data loss or visual regression.

### Non-Goals
*   This is **not** a full-featured web design tool like Webflow or Figma. We will not expose every possible CSS property.
*   We will **not** provide a freeform CSS editor in the primary UI. An escape hatch for power users may be considered in an "Advanced" section.

## 4. User Personas & Stories

*   **Persona 1: David, the Legacy Maintainer**
    *   **Needs:** To open, slightly modify, and save old forms without them breaking. He is not a designer and values predictability over power.
    *   **Story:** "As a maintainer, I want to open an old 'two-column' form and see it render exactly as it did before, so that I can confidently make a small text change without causing unintended layout issues."

*   **Persona 2: Maria, the Modern Form Designer**
    *   **Needs:** To build clean, aesthetically pleasing, and mobile-friendly forms. She is familiar with modern UI patterns but is not a CSS expert.
    *   **Story 1:** "As a form designer, I want to place a 'Save' and 'Cancel' button side-by-side at the bottom of a section, so that I can create a standard form action bar."
    *   **Story 2:** "As a form designer, I want to create a section of input fields that automatically wraps from three columns on a desktop to one column on a phone, so that the form is usable on any device."
    *   **Story 3:** "As a form designer, I want to select several fields on the canvas and group them together inside a new layout container, so I can quickly structure my form."

## 5. Core Feature: The `Layout Container`

The `Layout Container` is a new component type (`componentType: 'layout'`) that can be dragged from the "Layout" section of the component browser. It is the sole tool for grouping and arranging other components. It acts as a droppable area and can be nested within other `Layout Containers`.

### 5.1. Automated Legacy Migration

The system will include a transparent `upgradeLegacyScreen` utility that runs upon loading a screen.

*   **Case A1 (Legacy 1-column screen):** The utility wraps all existing form components into a single root `Layout Container` with its default "Vertical Stack" arrangement.
*   **Case A2 (Legacy 2-column screen):** The utility wraps all components into a single root `Layout Container` and sets its `Arrangement` to "Grid" with a `Column Layout` preset of "2 Columns (50/50)".

## 6. UX Specification & Wireframes

### 6.1. Properties Panel for `Layout Container`

*(This section remains the target specification for the UI and is unchanged.)*

The Properties Panel is the primary interface for controlling layouts. It uses progressive disclosure to keep the UI clean.

**State 1: Default (Vertical Stack)**
```ascii
+------------------------------------------+
| PROPERTIES: Layout Container             |
|------------------------------------------|
| ▼ Layout                                 |
|   Arrangement   [ Vertical Stack ▼]      |
|   Gap           [ Medium (16px) ▼ ]      |
|                                          |
| ▶ Spacing & Appearance                   |
|                                          |
| ▶ Advanced                               |
+------------------------------------------+
```

**State 2: Arrangement = Horizontal Row**
```ascii
+------------------------------------------+
| ▼ Layout                                 |
|   Arrangement     [ Horizontal Row ▼]      |
|   Distribution    [ Pack to Start ▼]     |
|   Vertical Align  [ Middle ▼       ]     |
|   Gap             [ Medium (16px)▼]      |
|   Allow Wrapping  [ ○- ] Off             |
+------------------------------------------+
```

**State 3: Arrangement = Grid**
```ascii
+------------------------------------------+
| ▼ Layout                                 |
|   Arrangement     [ Grid ▼]              |
|   Column Layout   [ 2 Columns (50/50) ▼] |
|   Gap             [ Medium (16px)▼]      |
+------------------------------------------+
```

### 6.2. Contextual Child Properties

*(This section remains the target specification for the UI and is unchanged.)*

When a component *inside* a `Layout Container` is selected, its own Properties Panel gains a contextual section.

**Wireframe: `TextInput` inside a Grid Container**
```ascii
+------------------------------------------+
| PROPERTIES: Text Input (First Name)      |
|------------------------------------------|
| ▼ Display                                |
|   ...                                    |
|------------------------------------------|
| ▼ Layout (in Grid)                       |
|   Parent: "User Details" Grid            |
|   (2 Columns, Medium Gap)                |
|                                          |
|   Column Span     [ 1 ▼]                 |
+------------------------------------------+
```

### 6.3. Canvas Interaction & Discoverability

The canvas must provide clear, unambiguous feedback about the layout structure and drag-and-drop operations.

#### 6.3.1. Drag-and-Drop Interaction Model

To eliminate "finicky" behavior, the system uses a hybrid feedback model that provides both macro (context) and micro (position) cues to the user.

1.  **Contextual Container Highlight ("Glow"):**
    *   **Behavior:** Whenever a user drags a component over any `Layout Container` or one of its children, the parent `Layout Container`'s border will highlight with a distinct color (e.g., a blue "glow").
    *   **Purpose:** This provides constant, ambient feedback, clearly and reliably communicating which container is the active drop target. This is especially critical for nested containers.

2.  **Predictive Line Indicator:**
    *   **Behavior:** A single, solid line appears in real-time to show the *exact* insertion point where the component will be placed upon release. This line intelligently positions itself:
        *   Before the first item in a container.
        *   Between any two items.
        *   After the last item in a container.
    *   **Purpose:** This provides precise, predictive feedback, removing all ambiguity about the drop outcome. This model replaces the need for a separate, clunky "drop here" zone at the bottom of lists.

#### 6.3.2. On-Canvas Actions

**Wireframe: Canvas & Selection Toolbar**
```ascii
+-------------------------------------------------------------+
| Canvas                                                      |
|  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  | (1)
|  . [Layout Container: Main Card]                          .  |
|  .  +---------------------------------------------------+  .  |
|  .  | [Email Field - SELECTED]                        | <----+
|  .  |                                                 |  .   | (2)
|  .  +---------------------------------------------------+  .   |
|  .  +---------------------------------------------------+  .   |
|  .  | [Phone Field]                                   |  .   |
|  .  |                                                 |  .   |
|  .  +---------------------------------------------------+  .   |
|  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  |
|                                                             |
+-------------------------------------------------------------+

(2) SELECTION TOOLBAR
+--[DRAG]--+--[Settings]--+--[Wrap in Container ⧚]--+--[Delete]--+
                           (3)
```
**(1) Visual Outlines:** All `Layout Containers` have a persistent but subtle dashed outline. Selection makes the outline solid and a different color.
**(3) "Wrap in Container" Action:** When one or more components are selected, the Selection Toolbar will display a "Wrap in Container" icon. Clicking this will:
    a. Create a new `Layout Container`.
    b. Place the selected component(s) inside it.
    c. Replace the original component(s) in the layout with the new container.
    This makes nesting an explicit, discoverable action.

## 7. Technical Requirements

*   **Data Model:** The component data model has been implemented with a union type to strongly represent different component variations.
    ```typescript
    // A union type representing any component that can be on the canvas
    export type CanvasComponent = FormComponent | LayoutComponent;

    export interface LayoutComponent extends BaseComponent {
      componentType: 'layout';
      children: string[]; // An ordered list of child component IDs
      properties: {
        arrangement: 'stack' | 'row' | 'grid';
        gap: 'none' | 'sm' | 'md' | 'lg';
        // ... other layout-specific properties
      };
    }
    ```
*   **Rendering Engine:** The canvas has been refactored to render components recursively, allowing for infinite nesting of `Layout Containers`.

*   **Drag-and-Drop:** The `dnd-kit` implementation has been engineered for robustness and a high-quality user experience:
    *   **Type-Safe Contract:** A centralized `DndData` TypeScript interface is used for all drag-and-drop data payloads, ensuring type safety and preventing data-related bugs.
    *   **State-Aware Logic:** Event handlers (`onDragOver`, `onDragEnd`) are state-aware. They use the application's component map as the source of truth to determine valid drop targets, rather than relying on `dnd-kit`'s internal IDs.
    *   **Declarative Feedback:** The DND interaction state (active item, hovered container, indicator position) is managed in global Jotai atoms (`activeDndIdAtom`, `overDndIdAtom`, `dropIndicatorAtom`). Components declaratively subscribe to this state to render feedback, decoupling the UI from the event handling logic.

*   **Multi-Select:** Multi-selection on the canvas is supported via the `selectedCanvasComponentIdsAtom` (an array of strings) in the global state, enabling the "Wrap in Container" feature.

## 8. Future Considerations (Post-v1.2)

*(This section remains unchanged.)*

*   **Interactive Responsive Preview:** A resizable preview pane in the Properties Panel to demonstrate wrapping behavior without resizing the main browser window.
*   **Non-Destructive Migration Backup:** For a transitional period, when a legacy screen is migrated and saved, store the original legacy JSON in a separate, backup field (`_legacyDataBackup`).
*   **Performance Optimization for Extreme Cases:** For screens with hundreds of components, investigate virtualization libraries to ensure the editor remains performant.

## 9. Success Metrics

*(This section remains unchanged.)*

*   **Adoption Rate:** Percentage of newly created screens that use at least one `Layout Container` within 3 months of launch.
*   **Time on Task:** Reduction in the average time it takes a user to create a standard two-column form compared to the legacy system.
*   **Feature Usage:** Track the usage of the "Wrap in Container" action to validate its discoverability.
*   **Qualitative Feedback:** User satisfaction surveys (NPS) specifically asking about the ease of use and power of the new layout system.
*   **Reduction in Legacy Code:** The eventual deprecation and removal of the old rendering logic from the codebase.