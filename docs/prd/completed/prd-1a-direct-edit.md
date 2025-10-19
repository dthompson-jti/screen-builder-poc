# PRD, UX Spec, & Arch Plan: Direct Editing Mechanism

This document specifies the creation of a reusable, high-craft mechanism for in-place text editing that will be applied to various canvas components.

---

## 1. Product Requirements Document (PRD)

### 1.1. Introduction & Goal

The core goal is to create a foundational, reusable text editing mechanism that provides a seamless, "what you see is what you get" experience. This mechanism will be the engine powering all in-canvas text editing, ensuring a consistent and intuitive workflow for users, starting with form labels and the new Plain Text component.

### 1.2. Core Features & Scope

*   **Activation**: Editing can be initiated via double-click or keyboard.
*   **Seamless Transition**: The transition between viewing and editing text must be invisible to the user, with no layout shift or style changes.
*   **Contextual Keyboard Input**: The `Enter` and `Escape` keys must behave predictably based on the context (single vs. multi-line editing).
*   **State Management**: The mechanism must not pollute the global undo/redo history with every keystroke. A single "commit" action will be recorded upon completion of an edit.
*   **Reusability**: The solution must be architected as a generic tool (e.g., a custom hook) that can be easily applied to any text-based component on the canvas.

### 1.3. User Stories

*   **As a user**, when I double-click text, I want to start typing immediately without any jarring visual changes to the text's style or position.
*   **As a developer**, I want a simple, reusable hook that I can apply to any component to make its text content editable in-place, without rewriting complex state logic.
*   **As a user**, I want my text edits to be registered as a single action in the undo history, so that one "Undo" command reverts the entire text change.

---

## 2. UX / UI Specification

### 2.1. Interaction Model

| Action | Form Label (Single-Line) | Plain Text (Multi-Line) |
| :--- | :--- | :--- |
| **Enter Edit Mode** | 1. Double-click the text.<br>2. Select the component and press `Enter`. | 1. Double-click the text.<br>2. Select the component and press `Enter`. |
| **Commit Changes** | 1. Click outside the component.<br>2. Press `Enter`. | 1. Click outside the component. |
| **Cancel Changes** | Press `Escape`. The text immediately reverts to its pre-edit state. | Press `Escape`. The text immediately reverts. |
| **New Line** | N/A | Press `Enter`. |

### 2.2. State Transitions & Visuals

*   **Editing State Activation**: Upon activation, the component's blue selection highlight and `SelectionToolbar` are hidden to remove visual clutter and focus the user on the text input.
*   **Seamless Input Overlay**:
    *   The rendered text element (`label`, `div`) is replaced by a visually identical `<input>` or `<textarea>`.
    *   This input element will have **all default browser styles reset** (border, background, padding, outline).
    *   It will inherit all typographic styles (font family, size, weight, color, line-height) directly from its parent to ensure a perfect visual match.
*   **Auto-Sizing**:
    *   **Single-line (`<input>`)**: The input's width will dynamically grow and shrink to match the content's width as the user types.
    *   **Multi-line (`<textarea>`)**: The `textarea`'s height will automatically adjust to fit the content, preventing scrollbars and providing a natural writing experience.

---

## 3. Architectural Plan

### 3.1. Core Logic: `useEditable` Custom Hook

The entire mechanism will be encapsulated in a single, reusable custom hook.

*   **File Location**: `src/data/useEditable.ts`
*   **Signature**: `useEditable(initialValue: string, onCommit: (newValue: string) => void, options?: { isMultiLine?: boolean; validationRule?: (value: string) => boolean; })`
*   **Internal State Management**:
    *   The hook will use `useState` for `isEditing` (boolean) and `currentValue` (string).
    *   **Critically, `onChange` events will only update the hook's internal `currentValue` state.** This prevents triggering global state updates on every keystroke, ensuring optimal performance and clean undo/redo history.
    *   The `onCommit` callback is only invoked once, when the edit is successfully completed.
*   **Return Value**: The hook will return an object containing two sets of props to be spread onto the display and input elements respectively:
    *   `displayProps`: `{ onDoubleClick: () => enterEditMode }`
    *   `inputProps`: `{ ref, value, onChange, onKeyDown, onBlur, style }`
*   **Auto-Sizing Implementation**: The hook will contain the logic for dynamically adjusting the input/textarea size during editing, updating the `style` property returned in `inputProps`.

### 3.2. Styling

*   **File Location**: `src/components/EditableText.module.css`
*   **Purpose**: This file will contain the essential CSS to create the "invisible" input experience.
    ```css
    .inlineInput, .inlineTextarea {
      /* Reset all browser defaults */
      appearance: none; border: none; outline: none; background: transparent; padding: 0; margin: 0;
      /* Inherit typography */
      font: inherit; color: inherit;
      /* Base layout */
      box-sizing: border-box; width: 100%;
    }
    .inlineTextarea {
      resize: none; overflow: hidden;
    }
    ```

### 3.3. Integration Strategy

1.  Create the `useEditable` hook and the associated CSS module as the first step.
2.  Integrate the hook into the existing `FormItem` component in `EditorCanvas.tsx` to make labels directly editable.
3.  Once this is working and tested, the `PlainText` component (from the other plan) can be built, becoming a second, straightforward consumer of the already-proven hook.

```

---

### Recommended Implementation Order

I recommend implementing these two features in the following order:

1.  **Implement Plan #2: Direct Editing Mechanism first.**
2.  **Implement Plan #1: New "Plain Text" Component second.**

#### Justification:

*   **Build the Foundation First**: The Direct Editing Mechanism, specifically the `useEditable` hook, is a foundational, reusable tool. Building this first is the most complex part of the overall feature. Once this tool is created, tested, and polished, implementing text editing on any component becomes significantly easier and faster.
*   **Deliver Incremental Value**: After completing Plan #2, you can immediately apply the `useEditable` hook to the **existing form field labels**. This delivers a tangible UX improvement to users without them having to wait for the new Plain Text component to be finished. It's a self-contained, valuable deliverable.
*   **De-risk the Second Step**: By proving the editing mechanism works perfectly on form labels, you remove all the technical risk and complexity from the second step. Building the Plain Text component then becomes a much simpler task of creating the component's shell and connecting it to the already-working hook.