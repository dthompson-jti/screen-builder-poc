Of course. Here is the consolidated PRD, UX Specification, and Architectural Plan in a single Markdown file, incorporating the high-craft approaches we evaluated.

---

# PRD & UX Spec: Immersive Preview Mode v1.0

*   **Document Version:** 1.0
*   **Date:** November 3, 2023
*   **Author:** [Your Name/Team]
*   **Status:** **Final**

## 1. Introduction & Vision

This document specifies the requirements for a new **Immersive Preview Mode** in Screen Studio. Currently, users can only build forms within the editor UI, lacking a clear, high-fidelity way to see how their final product will look and behave for an end-user.

The vision is to provide a dedicated, focused environment that bridges the gap between building and publishing. This mode will empower users to confidently validate their form's layout, styling, and responsiveness across a range of common device sizes, ensuring a high-quality outcome without guesswork.

## 2. Goals & Objectives

*   **Enable Confident Validation:** Allow users to see a pixel-perfect representation of their form, free from the editor's UI chrome.
*   **Facilitate Responsive Design:** Provide intuitive tools to test the form's layout on various screen widths, from mobile to desktop.
*   **Create a Polished Experience:** The preview mode itself should be a high-craft feature that feels intuitive, tactile, and professional.
*   **Ensure Architectural Integrity:** Build the feature on a robust, decoupled architecture that enhances maintainability and performance.

## 3. User Stories

*   **Persona: Maria, the Modern Form Designer**
    *   **Story 1:** "As a form designer, I want to quickly toggle to a 'what you see is what you get' view, so that I can check the final spacing and alignment of my components without being distracted by editor outlines and toolbars."
    *   **Story 2:** "As a form designer, I want to simulate how my three-column layout will look on a mobile phone, so I can ensure it correctly wraps to a single column and remains usable."
    *   **Story 3:** "As a form designer, I want to send a link to my project manager that opens directly to the tablet preview of the form, so they can approve the layout without needing to navigate the editor."

## 4. Core Features & Requirements

*   **Dedicated Preview View:** A new primary application view, accessible from the main header, that hides all editor-specific panels and UI.
*   **Preview Toolbar:** A new, context-aware toolbar will be the sole control surface within this view.
*   **Mode Switching:** The toolbar will feature a toggle to switch between two primary modes:
    *   **Desktop Mode:** Renders the form in a full-width, non-resizable container.
    *   **Web Mode:** Renders the form in a resizable, framed canvas to simulate various screen sizes.
*   **Responsive Web Controls:** When in "Web Mode," the toolbar will provide:
    *   **Device Presets:** One-click buttons to set the canvas width to standard sizes (e.g., Mobile: 390px, Tablet: 768px, Laptop: 1280px).
    *   **Manual Width Input:** A text input field that displays and allows editing of the precise canvas width in pixels.
*   **High-Fidelity Rendering:** The form preview will be a pixel-perfect match of the design configured in the editor.
*   **Persistent & Shareable State:** The user's selected preview mode and width will be stored in the URL, allowing for page reloads and link sharing.

## 5. UX Specification & Wireframes

### 5.1. Overall Layout

The preview mode presents a clean, centered view of the form within a simulated device frame.

```ascii
+----------------------------------------------------------------------------------+
| App Header: Screen Studio | ... | Form Name | [ Edit | PREVIEW | Settings ]      |
+----------------------------------------------------------------------------------+
| [ PREVIEW TOOLBAR                                                              ] |
|----------------------------------------------------------------------------------|
|                                                                                  |
|                      +-----------------------------------+                       |
|                      |                                   |                       |
|                      |      FORM PREVIEW CANVAS          |                       |
|                      |     (Rendered form appears        |                       |
|                      |      inside this frame)           |                       |
|                      |                                   |                       |
|                      +-----------------------------------+                       |
|                                                                                  |
+----------------------------------------------------------------------------------+
```

### 5.2. The Preview Toolbar

The toolbar is minimal and context-aware, revealing controls only when they are relevant.

*   **State 1: "Desktop" Mode (Default)**
    * The canvas below fills the available width.
    ```ascii
    +------------------------------------------------------------------------------+
    |  [🖥️ Desktop] [🌐 Web] <--(Mode Toggle; Desktop is active)                      |
    +------------------------------------------------------------------------------+
    ```

*   **State 2: "Web" Mode**
    * The canvas below is centered and resizes according to the controls.
    ```ascii
    +------------------------------------------------------------------------------+
    |  [🖥️ Desktop] [🌐 Web] <--(Web is active)  |  [📱] [📟] [💻] <--(Presets)  | [ 1280 px ] |
    +------------------------------------------------------------------------------+
    ```

### 5.3. User Flow

1.  A user in "Edit" mode clicks the "Preview" tab in the main application header.
2.  The application view smoothly transitions: all editor panels fade out, and the `PreviewView` fades in.
3.  The `PreviewToolbar` and the framed `FormPreviewCanvas` are displayed. By default, "Desktop" mode is active.
4.  The user clicks the "Web" button in the toolbar. The device presets and width input control appear. The `FormPreviewCanvas` animates to a default width (e.g., 1280px).
5.  The user clicks the "Mobile" preset [📱]. The canvas animates its width down to 390px, and the user observes their layout wrapping correctly.
6.  The user clicks back to the "Edit" tab. The UI seamlessly transitions back to the editor, preserving the user's scroll position and component selection. The next time they enter Preview Mode, the app will remember they were last in "Web" mode at 390px.

## 6. Technical Architecture & Implementation Plan

### 6.1. Core Architectural Principles

*   **Separation of Concerns:** The logic for editing the form (`EditorCanvas`) will be completely separate from the logic for displaying it (`FormRenderer`).
*   **URL as a Source of Truth:** The application's preview state will be reflected in the URL's query parameters to enable persistence and shareability.
*   **Direct Manipulation:** The user experience will favor direct interaction with the UI (e.g., a resizable frame) over disconnected controls where possible for a more tactile feel.

### 6.2. Component Architecture

*   **`src/views/PreviewView.tsx` (New):**
    *   **Responsibility:** The top-level component for this entire feature. It orchestrates the display of the toolbar and the preview canvas. It will be rendered by `App.tsx` when `appViewModeAtom` is `'preview'`.
    *   **State Management:** Reads from and writes to the new Jotai preview atoms.

*   **`src/components/PreviewToolbar.tsx` (New):**
    *   **Responsibility:** Renders the mode toggles, device presets, and width input. It contains no business logic, only firing callbacks for user interactions.

*   **`src/components/ResizableFrame.tsx` (New):**
    *   **Responsibility:** Renders the visual frame around the form canvas. For v1.0, its width is controlled by props. In a future version, it could contain its own logic for drag-to-resize handles.

*   **`src/components/FormRenderer.tsx` (New):**
    *   **Responsibility:** The core rendering engine. This is a "dumb" presentational component that receives the `allComponents` map and `rootComponentId` and recursively renders the form using plain HTML elements.
    *   **Implementation:** It will contain a `RenderNode` sub-component that maps component data to styled `div`s. It will reuse layout styling logic (e.g., a shared `useComponentStyles` hook) from `EditorCanvas.tsx` to ensure 1:1 visual parity. It will **not** contain any `dnd-kit` code, selection logic, or event handlers.

### 6.3. State Management & URL Sync

New Jotai atoms will be created to manage the preview state.

```typescript
// in src/data/atoms.ts
export type PreviewMode = 'desktop' | 'web';
export const previewModeAtom = atom<PreviewMode>('desktop');
export const previewWidthAtom = atom<number>(1280);
```

A new `useEffect` hook within `App.tsx` or a dedicated component will be responsible for synchronizing these atoms with the URL query parameters.

*   **On atom change:** Use `window.history.pushState` to update the URL (e.g., `/?view=preview&mode=web&width=390`).
*   **On initial load:** Parse the URL's query parameters and use them to set the initial values of the Jotai atoms.

### 6.4. File & Implementation Plan

1.  **State:** Add `previewModeAtom` and `previewWidthAtom` to `src/data/atoms.ts`.
2.  **Logic:** Create the URL synchronization logic within `App.tsx`.
3.  **Components:** Create the new components in order:
    *   `src/components/FormRenderer.tsx` (and its CSS module).
    *   `src/components/PreviewToolbar.tsx` (and its CSS module).
    *   `src/views/PreviewView.tsx` (and its CSS module). This will compose the toolbar and renderer.
4.  **Integration:** Update `src/App.tsx`'s `renderMainContent` function to replace the `FullScreenPlaceholder` with the new `<PreviewView />` in the `'preview'` case.

## 7. Future Considerations (Post-v1.0)

*   **Interactive Preview:** Enable basic form interactions like typing in text fields or toggling checkboxes.
*   **Drag-to-Resize:** Enhance the `ResizableFrame` component with draggable handles for direct, tactile resizing.
*   **Height Controls:** Add controls for adjusting the height of the preview canvas.

## 8. Success Metrics

*   **Adoption Rate:** Percentage of user sessions that engage with Preview Mode for more than 10 seconds.
*   **Feature Usage:** Track the usage of "Web Mode" and specific device presets to understand responsive design validation patterns.
*   **Qualitative Feedback:** User satisfaction surveys asking about their confidence in the final form output after using the preview.