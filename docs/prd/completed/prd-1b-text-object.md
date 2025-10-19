Of course. Here are two distinct plans, one for the **Plain Text Object** and another for the **Direct Editing Mechanism**. I've also included a recommendation on the implementation order at the end.

### Plan 1: New "Plain Text" Component

This plan covers the introduction of a new component for adding static, multi-line text to the canvas.

```markdown
# PRD, UX Spec, & Arch Plan: New "Plain Text" Component

This document outlines the plan for creating a new, general-purpose component for adding static text to the editor canvas.

---

## 1. Product Requirements Document (PRD)

### 1.1. Introduction & Goal

To give users more expressive control over screen design, we need to provide a way to add arbitrary, static text. This "Plain Text" component will serve as a fundamental building block for creating headers, instructional text, paragraphs, and other non-interactive content, moving beyond simple form field labels.

### 1.2. Core Features & Scope

*   **New Draggable Component**: A "Plain Text" component will be added to the "General" components panel.
*   **Canvas Integration**: The component can be dragged onto the canvas, reordered, and nested within layout containers like any other component.
*   **Multi-line Content**: The component must support multi-line text content, including line breaks.
*   **Empty State Handling**: The component is allowed to be empty, but must remain visible and selectable on the canvas.
*   **Properties Panel Integration**: Basic properties like text content will be editable via the Properties Panel as a fallback.

### 1.3. User Stories

*   **As a screen designer**, I want to drag a "Plain Text" component from the component browser onto my canvas so I can add a title or header to a section of my form.
*   **As a screen designer**, I want to place a block of text on the canvas to provide detailed instructions for the end-user.
*   **As a user**, when I add a new Plain Text component, I want it to have default content so I can immediately see and interact with it.

---

## 2. UX / UI Specification

### 2.1. Component Browser

*   **Location**: The "Plain Text" component will appear in the "General Components" browser.
*   **Appearance**:
    *   **Name**: "Plain Text"
    *   **Icon**: `notes` (a standard Material Symbol for text blocks)

### 2.2. Canvas Behavior

*   **Default State**: When a new Plain Text component is dragged onto the canvas, it will be pre-populated with the string "Plain Text".
*   **Styling**: The text will inherit the application's default body font styles.
*   **Empty State**:
    *   If a user deletes all the text, the component will not disappear.
    *   It will collapse to a minimum height of one line-height plus padding.
    *   It will display a subtle, greyed-out placeholder message: "Enter text".
    *   This ensures the element remains a visible, clickable target for selection and editing.

### 2.3. Properties Panel

*   When a Plain Text component is selected, the Properties Panel will show a "Content" section with a `textarea` field allowing users to edit the component's text. This serves as an alternative to direct in-canvas editing.

---

## 3. Architectural Plan

### 3.1. State & Type Definition (`types.ts`)

The `CanvasComponent` union type will be updated. We will add a `content` property to the `properties` object for widget components.

```typescript
// src/types.ts -> FormComponent (or a new TextComponent)

// Option A (Simpler): Reuse FormComponent for static text
export interface FormComponent extends BaseComponent {
  componentType: 'widget' | 'field';
  // ... existing properties
  properties: {
    label: string; // Used for form fields
    content?: string; // NEW: Used for Plain Text
    fieldName: string;
    required: boolean;
    controlType: 'text-input' | 'dropdown' | 'radio-buttons' | 'plain-text'; // NEW: Add 'plain-text'
  };
}
```

### 3.2. Component Implementation (`PlainText.tsx`)

*   **File Location**: `src/components/PlainText.tsx` and `src/components/PlainText.module.css`.
*   **Logic**:
    *   A new presentational component that renders the `content` property.
    *   It will be responsible for displaying the placeholder text when the content is empty.
    *   **This component will be designed to consume the `useEditable` hook (from the Direct Editing plan) to handle its in-place editing logic.**
*   **CSS**: The module will contain styles for the placeholder text (`.placeholder`).

### 3.3. System Integration

1.  **`historyAtoms.ts`**: The `COMPONENT_ADD` action handler in the reducer will be updated to create a `plain-text` component with default `content`. A new action, `COMPONENT_UPDATE_PROPERTIES`, will handle changes to the `content` property.
2.  **`GeneralComponentsBrowser.tsx`**: The `components` array will be updated to include the new "Plain Text" component definition.
3.  **`EditorCanvas.tsx`**: The main renderer will be updated to render the new `PlainText` component when it encounters a component with `controlType: 'plain-text'`.

```

---

### Plan 2: Direct Editing Mechanism

This plan details the reusable mechanism for enabling in-place text editing on the canvas.

```markdown
# PRD, UX Spec, & Arch Plan: Direct Editing Mechanism

This document specifies the creation of a reusable, high-craft mechanism for in-place text editing that will be applied to various canvas components.

