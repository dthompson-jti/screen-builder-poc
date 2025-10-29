# PRD: Shared Draggable Browser Item Component

### 1. Problem Statement

The `ComponentBrowser` and `GeneralComponentsBrowser` features both contain near-identical internal components named `DraggableListItem`. This creates significant code duplication for both the rendering logic (the list item's appearance) and the behavioral logic (the `useDraggable` hook setup). Maintaining and updating this UI is inefficient and error-prone.

### 2. Proposed Solution

A new, reusable component will be created at `src/features/ComponentBrowser/DraggableBrowserItem.tsx`.

*   **Component Name:** `DraggableBrowserItem`
*   **Props:** It will accept a single `component: DraggableComponent` prop.
*   **Responsibilities:**
    1.  Encapsulate the `useDraggable` hook from `dnd-kit`.
    2.  Correctly configure the `data` payload for the drag operation based on the `component` prop.
    3.  Render the list item UI, including the icon, name, and appropriate styling.

Both `ComponentBrowser.tsx` and `GeneralComponentsBrowser.tsx` will be refactored to import and use this new shared component, removing their local `DraggableListItem` implementations.

### 3. Acceptance Criteria

*   A new file exists: `src/features/ComponentBrowser/DraggableBrowserItem.tsx`.
*   `ComponentBrowser.tsx` is updated to use `<DraggableBrowserItem />` and its local `DraggableListItem` component is removed.
*   `GeneralComponentsBrowser.tsx` is updated to use `<DraggableBrowserItem />` and its local `DraggableListItem` component is removed.
*   Drag-and-drop functionality from both the "Data fields" and "General" panels remains fully functional with no regressions.
*   The visual appearance of the list items in both panels is unchanged.

### 4. Benefits

*   **Maintainability:** Changes to the browser item's appearance or drag behavior only need to be made in one file.
*   **Consistency:** Guarantees that all draggable items from any browser panel will look and behave identically.
*   **Code Reduction:** Adheres to the DRY (Don't Repeat Yourself) principle, reducing the overall lines of code in the project.