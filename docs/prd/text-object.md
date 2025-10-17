Of course. Here is the comprehensive Product Requirements, UX, and Architectural Specification document for the new text components, presented as a single Markdown file.

---

```markdown
# PRD & Technical Spec: Presentational Text & Link Components
- **Version:** 1.0
- **Status:** Final
- **Author:** Gemini

## 1. Product Requirements Document (PRD)

### 1.1. Introduction & Problem Statement
The Screen Studio currently lacks the ability to display non-interactive, static text. Users cannot add basic presentational content such as instructional text, section headings, or descriptive labels that aren't tied to a form input. This is a fundamental gap that prevents the creation of informationally rich and well-structured user interfaces.

### 1.2. Goals & Objectives
- **Enable Semantic Content:** Allow users to add and manage semantic text elements, specifically Headings and Paragraphs.
- **Provide a High-Craft UX:** Deliver an intuitive, on-canvas editing experience that minimizes context switching and saves clicks, drawing inspiration from best-in-class tools like Figma and Webflow.
- **Ensure Production-Quality Output:** The internal representation of these components must map directly to clean, correct, and accessible HTML (`<h1>`, `<p>`, etc.).
- **Establish a Scalable Architecture:** Create a data model and component structure that can easily accommodate future presentational components (e.g., Links, Blockquotes, Lists) without requiring significant refactoring.

### 1.3. Scope

#### **IN SCOPE (Phase 1)**
- **New Component Types:** `Heading` and `Paragraph`.
- **Component Browser:** Addition of "Heading" and "Paragraph" as draggable items in the "General Components" browser.
- **On-Canvas Editing:** Users will be able to double-click any text component to edit its content directly on the canvas (plain text only).
- **Properties Panel:** A dedicated set of properties will appear for selected text components, including the ability to change the content and morph the component's type (e.g., convert a Heading to a Paragraph).
- **Data Model:** Creation of a new, explicit data structure to represent these semantic components.

#### **OUT OF SCOPE (Future Enhancements)**
- **Rich Text Editing:** Bold, italics, underline, and other inline styling are explicitly out of scope for Phase 1. The component will only handle plain text.
- **Inline Links:** The ability to select a portion of text and convert it into a hyperlink is out of scope. The `Link` component will be treated as a separate, future feature.
- **`Label` Component:** A semantic `<label>` with a `for` attribute is deferred to a future phase due to the added complexity of linking it to a specific form input ID.
- **Global Style/Theme Editor:** The styling for variants (`h1`, `p`) will be built-in. A user-facing tool to define and manage these styles is a future feature.

## 2. User Experience (UX) Specification

### 2.1. Core Principles
- **On-Canvas is Primary:** The user's focus should remain on the canvas. The primary action of editing text will happen directly in-place.
- **Semantic Purity:** The user's choice in the UI will directly and unambiguously determine the final HTML output. There will be no disconnect between style and structure.
- **Forgiveness & Flexibility:** Users must be able to change their minds. Morphing a component from one type to another (e.g., `Paragraph` to `Heading`) should be a simple, non-destructive action.

### 2.2. User Flows & Interaction Details

#### 2.2.1. Adding a Text Component
1.  The user navigates to the "General Components" browser.
2.  They see distinct options for "Heading" (with a `title` icon) and "Paragraph" (with a `notes` icon).
3.  The user drags their desired component (e.g., "Heading") onto the canvas.
4.  A new Heading component appears on the canvas with placeholder text like "Heading". It is automatically selected.

#### 2.2.2. Editing Text Content
1.  **Selection:** A single click on a text component selects it, showing the standard selection frame and updating the Properties Panel.
2.  **Entering Edit Mode:** A double-click on the text component activates "edit mode."
    -   The selection frame disappears.
    -   A blinking cursor appears, and the text becomes fully editable directly on the canvas.
3.  **Exiting Edit Mode:** The user can exit edit mode in two ways:
    -   Pressing the `Escape` key.
    -   Clicking anywhere outside the text component's boundary.
4.  **Saving:** Upon exiting edit mode, the content changes are committed to the application's state and become part of the undo/redo history.

#### 2.2.3. Properties Panel Interaction
When a text component is selected, the Properties Panel will display the following sections:

-   **Content:**
    -   A `<textarea>` field labeled "Content" that is two-way bound to the component's text. This is useful for pasting large blocks of text or making edits without using the on-canvas mode.
-   **Typography (for `HeadingComponent`):**
    -   A `<Select>` dropdown labeled "Level" that allows the user to change between `Heading 1`, `Heading 2`, etc.
-   **Actions:**
    -   A section labeled "Convert To" containing buttons for other compatible text types.
        -   If a `Heading` is selected, a "Paragraph" button will be visible.
        -   If a `Paragraph` is selected, a "Heading" button will be visible.
        -   Clicking a "Convert To" button will morph the component type while preserving its content and ID.

## 3. Architecture & Technical Specification

This feature will be implemented using a **"Composition over Inheritance"** model. The data model will be explicit and semantic, while the rendering logic will be centralized for maximum code reuse and maintainability.

### 3.1. Data Model (`src/types.ts`)
New, distinct interfaces will be created for each text type. This ensures type safety and a data model that is honest about the user's intent.

```typescript
// --- Additions to src/types.ts ---

// A base interface for shared text properties
interface TextPropertiesBase {
  content: string;
}

// The specific interface for a Heading
export interface HeadingComponent extends BaseComponent {
  componentType: 'widget';
  widgetType: 'heading';
  properties: TextPropertiesBase & {
    level: 1 | 2; // Start with H1 and H2
  };
}

// The specific interface for a Paragraph
export interface ParagraphComponent extends BaseComponent {
  componentType: 'widget';
  widgetType: 'paragraph';
  properties: TextPropertiesBase;
}

// The WidgetComponent union will be updated to include these new types
export type WidgetComponent = FormComponent | HeadingComponent | ParagraphComponent /* | LinkComponent etc. */;

// The top-level CanvasComponent union is updated automatically
export type CanvasComponent = LayoutComponent | WidgetComponent;
```

### 3.2. State Management (`src/data/historyAtoms.ts`)
The `historyAtoms` will be updated to handle the creation and transformation of these new component types.

-   **New History Actions:**
    -   `COMPONENT_MORPH`: Payload `{ componentId: string; newType: 'heading' | 'paragraph'; newProperties: object }`. This action will be responsible for transforming a component from one type to another.
    -   `COMPONENT_UPDATE_WIDGET_PROPERTIES`: A generic action to update the `properties` object of any widget (Text, Link, etc.). Payload: `{ componentId: string; newProperties: object }`.

-   **Reducer Logic:**
    -   The `COMPONENT_ADD` reducer will be updated to handle the creation of `HeadingComponent` and `ParagraphComponent` with their default properties.
    -   The `COMPONENT_MORPH` reducer will perform the transformation by creating a new component object with the new `widgetType` and properties, while preserving the `id`, `parentId`, and `content`.

### 3.3. Component Implementation

-   **`GeneralComponentsBrowser.tsx`:**
    -   The draggable items list will be updated to include "starters" for the new text types.
    -   Dragging "Heading 1" will set `data` for the drag operation to create a `HeadingComponent` with `level: 1`.
    -   Dragging "Paragraph" will set `data` to create a `ParagraphComponent`.

-   **`TextRenderer.tsx` (New Reusable Component):**
    -   A new internal rendering component will be created. It is **not** a canvas component itself.
    -   **Props:** It will accept `tag: 'h1' | 'h2' | 'p'`, `content: string`, `isEditing: boolean`, `onContentChange: (newContent) => void`, etc.
    -   **Responsibility:** This component will contain all the complex logic for handling the `contentEditable` div, managing cursor state, and calling the `onContentChange` callback on blur or Escape.

-   **`EditorCanvas.tsx`:**
    -   The main component renderer (`FormItem` or a new `WidgetRenderer`) will contain a `switch` statement on `component.widgetType`.
    -   When `widgetType` is `'heading'`, it will render `<TextRenderer tag={`h${component.properties.level}`} ... />`.
    -   When `widgetType` is `'paragraph'`, it will render `<TextRenderer tag="p" ... />`.
    -   This component will manage the `isEditing` state for its children to ensure only one component can be in edit mode at a time.

-   **`PropertiesPanel.tsx`:**
    -   The panel will conditionally render different property sections based on the `selectedComponent.widgetType`.
    -   It will render the "Level" dropdown only for `heading` components.
    -   It will render the "Convert To" action buttons, which will dispatch the `COMPONENT_MORPH` action when clicked.
```