Got it. Incorporating that feedback to create a more robust and focused plan.

Here is the updated PRD & UX Spec in a single Markdown file.

---

# PRD & UX Spec: Smart Layout Container v1.1

*   **Document Version:** 1.1
*   **Date:** October 26, 2023
*   **Author:** [Your Name/Team]
*   **Status:** **Updated with Red Team Feedback**

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

*   **Case A1 (Legacy 1-column screen):** The utility wraps all existing form components into a single root `Layout Container` with its default "Vertical Stack" arrangement. The user sees their form as before, but it is now editable within the modern system.
*   **Case A2 (Legacy 2-column screen):** The utility wraps all components into a single root `Layout Container` and sets its `Arrangement` to "Grid" with a `Column Layout` preset of "2 Columns (50/50)". The form renders identically to the old system.

## 6. UX Specification & Wireframes

### 6.1. Properties Panel for `Layout Container`

The Properties Panel is the primary interface for controlling layouts. It uses progressive disclosure to keep the UI clean.

**State 1: Default (Vertical Stack)**

```ascii
+------------------------------------------+
| PROPERTIES: Layout Container             |
|------------------------------------------|
| ▼ Layout                                 |
|   Arrangement   [ Vertical Stack ▼]      | (1)
|   Gap           [ Medium (16px) ▼ ]      | (2)
|                                          |
| ▶ Spacing & Appearance                   | (3)
|                                          |
| ▶ Advanced                               |
+------------------------------------------+
```
**(1) Arrangement:** The core control. A dropdown/segmented control.
**(2) Gap:** Uses design tokens (`Small`, `Medium`, `Large`) for consistent spacing between children.
**(3) Progressive Disclosure:** More specific settings are collapsed by default.

---

**State 2: Arrangement = Horizontal Row**

```ascii
+------------------------------------------+
| ▼ Layout                                 |
|   Arrangement     [ Horizontal Row ▼]      |
|   Distribution    [ Pack to Start ▼]     | (4)
|   Vertical Align  [ Middle ▼       ]     | (5)
|   Gap             [ Medium (16px)▼]      |
|   Allow Wrapping  [ ○- ] Off             | (6)
+------------------------------------------+
```
**(4) Distribution:** Plain-language abstraction for `justify-content`.
**(5) Vertical Align:** Plain-language abstraction for `align-items`.
**(6) Allow Wrapping:** When toggled ON, reveals a new setting: **`Wrap items when they get smaller than...`** This input enables automatic, fluid responsiveness.

---

**State 3: Arrangement = Grid**
This mode uses presets for common, powerful layouts, with an advanced option for full control.

```ascii
+------------------------------------------+
| ▼ Layout                                 |
|   Arrangement     [ Grid ▼]              |
|   Column Layout   [ 2 Columns (50/50) ▼] | (7)
|   Gap             [ Medium (16px)▼]      |
+------------------------------------------+
```
**(7) Column Layout:** A dropdown of common, visualized presets:
*   `1 Column`
*   `2 Columns (50/50)`
*   `3 Columns (33/33/33)`
*   `Sidebar Left (33/67)`
*   `Sidebar Right (67/33)`
*   `Advanced...` (reveals a text input for raw `grid-template-columns` syntax).

### 6.2. Contextual Child Properties

When a component *inside* a `Layout Container` is selected, its own Properties Panel gains a contextual section.

**Wireframe: `TextInput` inside a Grid Container**

```ascii
+------------------------------------------+
| PROPERTIES: Text Input (First Name)      |
|------------------------------------------|
| ▼ Display                                |
|   ...                                    |
|------------------------------------------|
| ▼ Layout (in Grid)                       | (8)
|   Parent: "User Details" Grid            | (9)
|   (2 Columns, Medium Gap)                |
|                                          |
|   Column Span     [ 1 ▼]                 | (10)
+------------------------------------------+
```
**(8) Contextual Section:** Only appears when the component is a child of a layout container.
**(9) Read-Only Parent Info:** Displays key settings from the parent container for context, clarifying why the child behaves as it does.
**(10) Child Overrides:** Simple controls (e.g., a dropdown for `Column Span`) to modify how this specific child behaves within its parent's layout rules.

### 6.3. Canvas Interaction & Discoverability

The canvas must provide clear feedback about the layout structure. Nesting will be made discoverable through direct interaction.

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
+--[DRAG]--+--[Settings]--+--[Wrap in Container ⚯]--+--[Delete]--+
                           (3)
```
**(1) Visual Outlines:** All `Layout Containers` have a persistent but subtle outline (e.g., dashed line). Selection makes the outline solid and a different color.
**(3) "Wrap in Container" Action:** When one or more components are selected, the Selection Toolbar will display a new "Wrap in Container" icon. Clicking this will:
    a. Create a new `Layout Container`.
    b. Place the selected component(s) inside it.
    c. Replace the original component(s) in the layout with the new container.
    This makes nesting an explicit, discoverable action.

## 7. Technical Requirements

*   **Data Model:** The `FormComponent` interface must be updated to support nesting, responsive properties, and named containers.
    ```typescript
    interface FormComponent {
      id: string;
      name?: string; // User-defined name, e.g., "Header Row"
      componentType: 'widget' | 'field' | 'layout';
      children?: FormComponent[];
      properties?: { /* ... */ };
      layoutChildProperties?: { /* ... */ };
    }
    ```
*   **Rendering Engine:** The canvas must be refactored to render components recursively.
*   **Drag-and-Drop:** `dnd-kit` implementation must be upgraded to handle nested droppable areas.
*   **Multi-Select:** The canvas must support selecting multiple components (e.g., with Shift+Click) to enable the "Wrap in Container" feature.

## 8. Future Considerations (Post-v1.1)

The following ideas from the Red Team analysis are valuable but deferred from the initial implementation to manage scope. They will be considered for future releases.

*   **Interactive Responsive Preview:** A resizable preview pane in the Properties Panel to demonstrate wrapping behavior without resizing the main browser window.
*   **Non-Destructive Migration Backup:** For a transitional period, when a legacy screen is migrated and saved, store the original legacy JSON in a separate, backup field (`_legacyDataBackup`).
*   **Performance Optimization for Extreme Cases:** For screens with hundreds of components, investigate virtualization libraries (`react-window` or `tanstack-virtual`) to ensure the editor remains performant.

## 9. Success Metrics

*   **Adoption Rate:** Percentage of newly created screens that use at least one `Layout Container` within 3 months of launch.
*   **Time on Task:** Reduction in the average time it takes a user to create a standard two-column form compared to the legacy system.
*   **Feature Usage:** Track the usage of the "Wrap in Container" action to validate its discoverability.
*   **Qualitative Feedback:** User satisfaction surveys (NPS) specifically asking about the ease of use and power of the new layout system.
*   **Reduction in Legacy Code:** The eventual deprecation and removal of the old rendering logic from the codebase.