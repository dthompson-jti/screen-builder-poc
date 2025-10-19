We are working on this feature.  Right now there are a few issues.  Rename isn't actually working.  It correctly brings up an edit mode, but does not take any text changes from keyboard.

As context.  I was working on one fork of this and thigns went downhill.  I've tried to revert some files back, but there could be some mix-ups or regressions.

Let's srtart with the rename functionality, but also look for other issues.  Make a strucutred list.

For all issues. Diagnose 3-4 potential root causes.  Do end to end code traces to gather evidence and ask questions to self against files.  Narrow down and plan a robust fix.

analysis and planning only.

---

---

### **Specification: The Canvas Editor**

#### 1. Guiding Principles & Vision

The Canvas Editor is a fluid, stable, and intuitive environment for direct-manipulation form building. Every user action must feel instantaneous and predictable, with zero visual flicker or layout shift. The interaction model prioritizes clarity and efficiency, empowering users to build complex layouts with confidence.

#### 2. Core Interaction Model

This table defines the fundamental user actions and their expected outcomes.

| User Action | Input | Expected Behavior | Visual Contract |
| :--- | :--- | :--- | :--- |
| **Single Select** | Single-Click on a component | The clicked component becomes the sole selected item. The `SelectionToolbar` appears above it. Any previous selection is cleared. | Instantaneous. No flicker. |
| **Multi-Select** | `Shift` + Click on a component | Adds or removes the component from the current selection set. If `>1` items are selected, the `FloatingSelectionToolbar` appears. | Instantaneous. No flicker. |
| **Deselect All** | Click on the canvas background | All selections are cleared. All toolbars disappear. | Instantaneous. |
| **Initiate Edit** | `Alt` + Click on a form item | The component enters inline-edit mode for its label **atomically**. No `SelectionToolbar` should ever flash or appear. | The component's label is immediately replaced by an active text input, pre-filled and selected. No layout shift. |
| **Initiate Edit (Keyboard)** | Select a single form item, then press `Enter` | The component enters inline-edit mode for its label. The `SelectionToolbar` disappears. | The component's label is immediately replaced by an active text input. No layout shift. |
| **Commit Edit** | Press `Enter` or `Blur` (click outside) from an inline editor | The change is saved. The component exits edit mode and returns to a **selected** state. | Instantaneous. The text input is replaced by the new label text. |
| **Cancel Edit** | Press `Escape` from an inline editor | The change is discarded. The component exits edit mode and returns to a **selected** state. | Instantaneous. The text input is replaced by the original label text. |
| **Drag & Drop** | Click & Drag the **drag handle** on the `SelectionToolbar` | A drag operation begins. A non-interactive drag overlay representing the component appears under the cursor. The original component remains visible but may have a "dragging" style. | Smooth transition to dragging state. The component follows the cursor. Drop targets are clearly indicated. |
| **Delete** | Click `Delete` in a toolbar or press `Delete`/`Backspace` key | The selected component(s) are removed from the canvas. The selection is cleared. | The component(s) disappear. The layout reflows smoothly. |
| **Wrap/Group** | Select one or more components, then press `Cmd/Ctrl`+`G` or click the "Wrap" button | The selected components are wrapped in a new default Layout Container. The new container becomes selected. | Components are visually nested inside a new container. |
| **Unwrap/Ungroup** | Select a single Layout Container, then press `Cmd/Ctrl`+`Shift`+`G` | The container is removed, and its children are moved into the container's parent at the same position. The unwrapped children become selected. | The container outline disappears, and its children are re-parented. |

---

#### 3. Component States & Behaviors

##### 3.1. Form Components (e.g., Text Input, Dropdown)
*   **Default State:** No border. Responds to hover. Clickable to select.
*   **Hover State:** A subtle background color change to indicate interactivity.
*   **Selected State:** A solid theme-colored border appears. The `SelectionToolbar` is displayed directly above it.
*   **Editing State:** The component's label is visually replaced by an active `<input>` field. The component maintains its selected state border. No `SelectionToolbar` is visible.

##### 3.2. Layout Components (Containers)
*   **Default State:** A dashed border to indicate it's a structural element and drop target.
*   **Hover State:** The dashed border becomes more prominent or changes color.
*   **Selected State:** The border becomes a solid, theme-colored line. The `SelectionToolbar` is displayed above it. Layout containers cannot enter an "Editing" state.

##### 3.3. Selection Toolbar
*   **Appearance:** Appears **only** when a single component (Form or Layout) is selected.
*   **Position:** Floats directly above the selected component.
*   **Controls:**
    *   **Drag Handle (`drag_indicator`):** The *exclusive* element for initiating a drag-and-drop operation for a canvas component.
    *   **Rename (`edit`):** Transitions the component into the inline-edit state.
    *   **More Options (`more_vert`):** Opens a dropdown menu (`SelectionToolbarMenu`).
*   **Menu (`SelectionToolbarMenu`):**
    *   **Nudge Up/Down:** Moves the component one step within its parent container.
    *   **Delete:** Removes the component.

##### 3.4. Floating Multi-Select Toolbar
*   **Appearance:** Appears at the bottom-center of the canvas viewport **only** when 2 or more components are selected.
*   **Controls:**
    *   **Wrap (`pageless`):** Wraps all selected components in a new Layout Container.
    *   **Delete (`delete`):** Deletes all selected components.

---

#### 4. Keyboard Shortcuts & Accessibility

| Key(s) | Context | Action |
| :--- | :--- | :--- |
| `Enter` | A single form component is selected. | Enter inline-edit mode. |
| `Escape` | In inline-edit mode. | Cancel edit and return to selected state. |
| `Delete` / `Backspace` | One or more components are selected. | Delete the selected component(s). |
| `↑` / `↓` Arrow | A single component is selected. | Nudge the component up or down in its container. |
| `Shift` + `↑` / `↓` Arrow | A single component is selected. | Move the component to the adjacent container above or below. |
| `Cmd/Ctrl` + `G` | One or more components are selected. | Wrap the selection in a new Layout Container. |
| `Cmd/Ctrl` + `Shift` + `G` | A single Layout Container is selected. | Unwrap the container. |
| `Cmd/Ctrl` + `Z` | Any | Undo the last action. |
| `Cmd/Ctrl` + `Y` / `Shift`+`Z` | Any | Redo the last undone action. |

---

#### 5. Non-Functional Requirements

*   **Visual Stability:** The UI **MUST NOT** flicker, judder, or shift layout during any state transition (e.g., selecting, initiating an edit, committing an edit). All state transitions must be atomic from the user's perspective.
*   **Performance:** All interactions, especially drag-and-drop, must feel smooth and responsive, even with a large number of components on the canvas.
*   **State Integrity:** The application state must remain consistent. Actions like Undo/Redo must reliably restore not only the component data but also the selection and interaction state of the canvas at that point in time.