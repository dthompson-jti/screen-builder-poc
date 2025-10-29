    Of course. Here is the complete, consolidated Phase 2 plan, incorporating all evaluated components (`Dialog`, `Tabs`, `Popover`, `Toggle Group`, `Accordion`, `Toolbar`, `Toggle`, `Toast`).

    This PRD is structured for clarity, with each component getting its own dedicated section covering requirements, UX/UI specifications (with wireframes and token mapping), architectural decisions, and a file manifest.

    ---

    ## Phase 2 Plan: Radix Component Library Specification

    This document outlines the complete specifications for building out the core UI primitive library using Radix UI. It incorporates all learnings from Phase 1, focusing on accessibility, robustness, and architectural consistency.

    ---

    ### 1. Radix Primitive: Dialog (Modal)

    #### **1.1. PRD (Product Requirements Document)**

    *   **Goal:** Replace the existing custom `Modal.tsx` with a robust, accessible, and themeable foundation based on Radix Dialog. This aligns with the "Robust Primitives" architectural principle.
    *   **Functional Requirements:**
        *   The component must render children within a centered, pop-up container.
        *   It must display a semi-transparent backdrop overlay.
        *   It must be dismissible by clicking the overlay or pressing the `Escape` key.
    *   **Accessibility Requirements:**
        *   Focus must be trapped within the dialog when open.
        *   Content outside the dialog must be made `inert`.
        *   Body scroll must be locked to prevent background scrolling.
        *   Radix must handle all necessary ARIA attributes (`role="dialog"`, `aria-modal="true"`, etc.).

    #### **1.2. UX & UI Specification**

    ```ascii
    +--------------------------------------------------+
    |             <Backdrop Overlay>                   |
    |   +------------------------------------------+   |
    |   | <Dialog Container>                       |   |
    |   |                                          |   |
    |   |          ... Dialog Content ...          |   |
    |   |                                          |   |
    |   +------------------------------------------+   |
    |                                                  |
    +--------------------------------------------------+
    ```

    *   **Backdrop Overlay (`<RadixDialog.Overlay>`):**
        *   `background-color`: `rgba(10, 12, 18, 0.7)` (Corresponds to `--surface-bg-overlay` with added alpha).
        *   `z-index`: `1000`.
    *   **Dialog Container (`<RadixDialog.Content>`):**
        *   `background-color`: `var(--surface-bg-primary)`
        *   `border-radius`: `var(--spacing-3)` (12px)
        *   `border`: `1px solid var(--surface-border-primary)`
        *   `box-shadow`: `var(--surface-shadow-2xl)`
    *   **Animation:**
        *   The backdrop will `fadeIn` on open (`[data-state="open"]`).
        *   The dialog container will use a combined `fadeIn` and `scaleIn` keyframe animation for a high-craft entrance.

    #### **1.3. Architecture Specification**

    *   **Pattern:** Centralized Wrapper with Sub-components.
    *   **Decision:** We will create a `<Modal>` wrapper that exposes sub-components (`<Modal.Header>`, `<Modal.Content>`, `<Modal.Footer>`). This compound component pattern provides superior flexibility and promotes a consistent structure for all modals.
    *   **Wrapper (`Modal.tsx`):** A new `src/components/Modal.tsx` will be created to export the main `Modal` component and its sub-components.
    *   **Theming (`modal.css`):** A new `src/modal.css` file will contain the theme for the Radix components, targeting their `data-*` attributes for stateful animations.
    *   **Integration:** `DataBindingModal.tsx` will be refactored to use the new `<Modal>`, `<Modal.Header>`, etc. components, making its implementation cleaner and more declarative.

    #### **1.4. File Manifest**

    *   **To be Created:**
        *   `src/components/Modal.tsx` (Wrapper component with sub-components)
        *   `src/modal.css` (Theme file)
    *   **To be Modified:**
        *   `src/components/DataBindingModal.tsx`: To use the new `<Modal>` wrapper.
        *   `src/index.css`: To `@import './modal.css' layer(components);`.
    *   **To be Deleted:**
        *   The old `src/components/Modal.module.css`.

    ---

    ### 2. Radix Primitive: Tabs

    #### **2.1. PRD (Product Requirements Document)**

    *   **Goal:** Replace custom tab implementations with a single, robust, and accessible solution based on Radix Tabs.
    *   **Functional Requirements:**
        *   Allow switching between different content panels by clicking tab triggers.
    *   **Accessibility Requirements:**
        *   Full keyboard navigation (`ArrowLeft`/`ArrowRight`, `Home`, `End`).
        *   Correct ARIA roles (`tablist`, `tab`, `tabpanel`).

    #### **2.2. UX & UI Specification**

    ```ascii
    [ Trigger 1 ]  [ Trigger 2 ]  [ Trigger 3 ]
    -------------
    ^             ^                ^
    Label         Underline        Inactive Trigger
    ```

    *   **Triggers (`<RadixTabs.Trigger>`):**
        *   **Rest State:** `color: var(--surface-fg-quaternary)`.
        *   **Hover State:** `color: var(--surface-fg-theme-strong)`.
        *   **Active State (`[data-state="active"]`):** `color: var(--surface-fg-theme-strong)`.
    *   **Active Indicator (Underline):**
        *   `height`: `2px`.
        *   `background-color`: `var(--surface-fg-theme-strong)`.
        *   **Animation:** Must animate `width` and `left` position smoothly between tabs of different sizes.

    #### **2.3. Architecture Specification**

    *   **Pattern:** Centralized Theme + Stateful Wrapper for Animation.
    *   **Decision:** A JS-driven animation using Framer Motion's `layout` prop is the chosen approach. It provides a declarative, performant, and high-craft solution for animating the underline between dynamically sized tabs.
    *   **Implementation:**
        *   Create a reusable `AnimatedTabs` component that wraps Radix Tabs and contains the state and logic for the animated underline.
        *   The existing `src/tabs.css` will be overhauled to become a theme for Radix Tabs primitives.
    *   **Integration:** `AppHeader.tsx` (for Edit/Preview/Settings) and `PropertiesPanel.tsx` will be refactored to use the new `<AnimatedTabs>` component.

    #### **2.4. File Manifest**

    *   **To be Overhauled:**
        *   `src/tabs.css`
    *   **To be Modified:**
        *   `src/features/AppHeader/AppHeader.tsx`
        *   `src/features/Editor/PropertiesPanel/PropertiesPanel.tsx`

    ---

    ### 3. Radix Primitive: Popover

    #### **3.1. PRD (Product Requirements Document)**

    *   **Goal:** Replace custom popover logic (e.g., `NameEditorPopover.tsx`) with a robust, accessible foundation from Radix Popover.
    *   **Functional Requirements:**
        *   Appear anchored to a trigger element.
        *   Non-modal, dismissible by clicking outside or pressing `Escape`.
    *   **Robustness:** Must intelligently reposition itself to avoid viewport collision.
    *   **Accessibility Requirements:** Correct ARIA associations and focus management handled by Radix.

    #### **3.2. UX & UI Specification**

    ```ascii
                +----------------------+
                | <Popover Content>    |
                |                      |
                +----------v-----------+
                        <Arrow>
                    [ Trigger Button ]
    ```

    *   **Content Container (`<RadixPopover.Content>`):**
        *   `background-color`: `var(--surface-bg-primary)`
        *   `border-radius`: `var(--spacing-2)` (8px)
        *   `box-shadow`: `var(--surface-shadow-xl)`
        *   `border`: `1px solid var(--surface-border-primary)`
    *   **Arrow (`<RadixPopover.Arrow>`):**
        *   `fill`: `var(--surface-border-primary)`
    *   **Animation:** `fadeIn` and slide away from the trigger on open.

    #### **3.3. Architecture Specification**

    *   **Pattern:** Centralized Wrapper Component.
    *   **Decision:** A mandatory `<Popover>` wrapper is the chosen approach. It will encapsulate all styling, animation, and the `Arrow`, guaranteeing every popover in the app looks and feels identical and upholding the "Single Source of Truth" principle for styling.
    *   **Wrapper (`Popover.tsx`):** A new `src/components/Popover.tsx` will be created to provide the standard themed wrapper around Radix primitives.
    *   **Integration:** `NameEditorPopover.tsx` will be refactored to use this new `<Popover>` component, removing all custom positioning and `useOnClickOutside` logic.

    #### **3.4. File Manifest**

    *   **To be Created:**
        *   `src/components/Popover.tsx` (Wrapper component)
        *   `src/popover.css` (Theme file)
    *   **To be Modified:**
        *   `src/components/NameEditorPopover.tsx`
        *   `src/index.css`: To `@import './popover.css' layer(components);`.
    *   **To be Deleted:**
        *   `src/components/NameEditorPopover.module.css`

    ---

    ### 4. Radix Primitive: Toggle Group

    #### **4.1. PRD (Product Requirements Document)**

    *   **Goal:** Replace the custom `IconToggleGroup.tsx` with an accessible, semantically correct version from Radix Toggle Group.
    *   **Use Case:** Exclusive choice controls, like text alignment or layout arrangement in the Properties Panel.
    *   **Accessibility Requirements:** Must use `role="group"`, support arrow key navigation, and correctly manage `aria-checked`/`data-state`.

    #### **4.2. UX & UI Specification**

    ```ascii
    +------------------------------------+
    | [ Item 1 ] [ Item 2 ] [ Item 3 ]   |
    +------------------------------------+
    ^            ^
    Selected     Rest/Hover State
    ```

    *   **Container (`<RadixToggleGroup.Root>`):**
        *   A single visual unit with a shared border and `border-radius: 6px`. Items have collapsed internal borders.
    *   **Items (`<RadixToggleGroup.Item>`):**
        *   **Rest State:** `background-color: var(--surface-bg-primary)`, `color: var(--surface-fg-secondary)`.
        *   **Hover State:** `background-color: var(--control-bg-tertiary-hover)`, `color: var(--control-fg-tertiary-hover)`.
        *   **Selected State (`[data-state="on"]`):** `background-color: var(--control-bg-selected)`, `color: var(--control-fg-selected)`, `border-color: var(--control-border-selected)`.
        *   **Craft Detail:** The selected/hovered item must have a higher `z-index` to ensure its border overlaps its neighbors cleanly.

    #### **4.3. Architecture Specification**

    *   **Pattern:** Refactor Existing Wrapper.
    *   **Decision:** The existing `src/components/IconToggleGroup.tsx` will be refactored to wrap the Radix primitives. A new global `toggle-group.css` will be created to style the component via `data-state` attributes, replacing the old CSS Module.

    #### **4.4. File Manifest**

    *   **To be Created:**
        *   `src/toggle-group.css` (Theme file)
    *   **To be Modified:**
        *   `src/components/IconToggleGroup.tsx`
        *   `src/index.css`: To `@import './toggle-group.css' layer(components);`.
    *   **To be Deleted:**
        *   `src/components/IconToggleGroup.module.css`

    ---

    ### 5. Radix Primitive: Accordion

    #### **5.1. PRD (Product Requirements Document)**

    *   **Goal:** Introduce a robust, collapsible section component for the Properties Panel to improve organization and reduce clutter.
    *   **Functional Requirements:**
        *   Show/hide content by clicking a header.
        *   Support multiple panels being open simultaneously (`type="multiple"`).
    *   **Accessibility Requirements:** Full keyboard navigation (`ArrowUp`/`ArrowDown`, `Enter`/`Space`) and ARIA attributes handled by Radix.

    #### **5.2. UX & UI Specification**

    ```ascii
    +------------------------------------------+
    | < v Section Title 1 >                    |  <-- Trigger (Open)
    +------------------------------------------+
    |  <Content Panel>                         |
    |  ...properties...                        |
    +------------------------------------------+
    | < > Section Title 2 >                    |  <-- Trigger (Closed)
    +------------------------------------------+
    ```

    *   **Trigger (`<RadixAccordion.Trigger>`):**
        *   Full-width header containing a label and a chevron icon.
        *   `font-weight: 600`.
        *   **Hover State:** `background-color: var(--control-bg-tertiary-hover)`.
        *   **Chevron Icon:** Must rotate `180deg` smoothly on state change.
    *   **Content (`<RadixAccordion.Content>`):**
        *   Must animate its height smoothly for expand/collapse.
        *   Content should be indented with `padding`.

    #### **5.3. Architecture Specification**

    *   **Pattern:** Centralized Wrapper Component.
    *   **Decision:** We will use the modern, performant CSS Grid `grid-template-rows` animation (`0fr` to `1fr`) for the expand/collapse effect, as it is a high-craft detail that avoids `height: auto` limitations.
    *   **Wrapper (`Accordion.tsx`):** A new `src/components/Accordion.tsx` will provide a styled wrapper around all necessary Radix primitives.
    *   **Integration:** The property sections (`.propSection`) inside `LayoutEditor.tsx`, `FormEditor.tsx`, etc., will be refactored to be wrapped in `<Accordion.Item>`.

    #### **5.4. File Manifest**

    *   **To be Created:**
        *   `src/components/Accordion.tsx` (Wrapper component)
        *   `src/accordion.css` (Theme file)
    *   **To be Modified:**
        *   All Property Panel editors (e.g., `LayoutEditor.tsx`, `FormEditor.tsx`).
        *   `src/index.css`: To `@import './accordion.css' layer(components);`.

    ---

    ### 6. Radix Primitive: Toolbar

    #### **6.1. PRD (Product Requirements Document)**

    *   **Goal:** Refactor the floating `SelectionToolbar` to use the accessible and semantically correct `@radix-ui/react-toolbar` primitive.
    *   **Accessibility Requirements:**
        *   Full keyboard navigation between toolbar items (`ArrowLeft`/`ArrowRight`, `Home`/`End`).
        *   The container must have `role="toolbar"`.
        *   Focus should wrap from the last item to the first and vice-versa.

    #### **6.2. UX & UI Specification**

    The visual appearance will be identical to the existing `SelectionToolbar`.

    ```ascii
    +-------------------------------------------------------------+
    | [ Drag ] | [ Rename ] [ Wrap ] [ More... ]                    |
    +-------------------------------------------------------------+
        ^        ^           ^
        Button   Separator   Button Group
    ```

    *   **Container (`<RadixToolbar.Root>`):**
        *   `background-color`: `var(--surface-bg-brand-solid)`
        *   `border-radius`: `var(--spacing-2)`
        *   `box-shadow`: `var(--surface-shadow-lg)`
    *   **Buttons (`<RadixToolbar.Button>`):**
        *   Will use the existing `<Button variant="on-solid" asChild>` component to ensure visual consistency.
    *   **Separator (`<RadixToolbar.Separator>`):**
        *   A `1px` vertical line with `background-color: var(--primitives-dark-tint-700)`.

    #### **6.3. Architecture Specification**

    *   **Pattern:** Refactor Existing Component.
    *   **Decision:** The existing `SelectionToolbar.tsx` will be refactored to use `RadixToolbar` primitives as its internal structure. This is a direct enhancement that requires no new files.

    #### **6.4. File Manifest**

    *   **To be Modified:**
        *   `src/features/Editor/SelectionToolbar.tsx`
        *   `src/features/Editor/SelectionToolbar.module.css`

    ---

    ### 7. Radix Primitive: Toggle

    #### **7.1. PRD (Product Requirements Document)**

    *   **Goal:** Establish a new, accessible, single-button toggle primitive for future use.
    *   **Use Cases (Future):** A "Bold" or "Italic" button, a view-switcher button.
    *   **Accessibility Requirements:**
        *   Must render a `<button>` with the `aria-pressed` attribute managed automatically by Radix.
        *   Must have a distinct visual style for its `[data-state="on"]` state.

    #### **7.2. UX & UI Specification**

    This will be styled to fit seamlessly alongside the existing `<Button variant="tertiary">`.

    ```ascii
    +-----------+    +-----------+
    |  [ Icon ] |    |  [ Icon ] |
    +-----------+    +-----------+
    Rest/Hover      Pressed/On State
    ```

    *   **Rest State (`[data-state="off"]`):** `background`: `none`.
    *   **Hover State:** `background-color`: `var(--control-bg-tertiary-hover)`.
    *   **Pressed/On State (`[data-state="on"]`):** `background-color`: `var(--control-bg-tertiary-pressed)`.

    #### **7.3. Architecture Specification**

    *   **Pattern:** Centralized Wrapper Component.
    *   **Decision:** Create a new reusable `<Toggle>` component in `src/components/Toggle.tsx`. This component will wrap `RadixToggle.Root` and apply the correct base classes and `data-` attributes for styling.

    #### **7.4. File Manifest**

    *   **To be Created:**
        *   `src/components/Toggle.tsx` (Wrapper component)
        *   `src/toggle.css` (Theme file)
    *   **To be Modified:**
        *   `src/index.css`: To `@import './toggle.css' layer(components);`.

    ---

    ### 8. Radix Primitive: Toast

    #### **8.1. PRD (Product Requirements Document)**

    *   **Goal:** Migrate the existing custom toast notification system to use the more robust and accessible `@radix-ui/react-toast` primitives.
    *   **Functional Requirements:**
        *   Toasts should appear at the bottom-center of the screen.
        *   They should be dismissible via a swipe gesture on touch devices.
        *   They should automatically disappear after a timeout.
    *   **Accessibility Requirements:**
        *   Radix will manage ARIA live regions for screen reader announcements.
        *   Radix will manage focus to be non-intrusive.

    #### **8.2. UX & UI Specification**

    The visual appearance will be identical to the existing toast implementation.

    *   **Viewport (`<RadixToast.Viewport>`):** An invisible container fixed to the bottom-center of the screen.
    *   **Container (`<RadixToast.Root>`):**
        *   `background-color`: `var(--primitives-grey-900)`
        *   `color`: `var(--surface-fg-white)`
        *   `border-radius`: `var(--spacing-2)`
        *   `box-shadow`: `var(--surface-shadow-lg)`
    *   **Animation:** The toast should slide up and fade in on open, and slide down and fade out on close.

    #### **8.3. Architecture Specification**

    *   **Pattern:** Refactor Existing System.
    *   **Decision:** This is a valuable but lower-priority refactor. The existing `ToastContainer.tsx` will be refactored to be the `ToastProvider` and render the `<RadixToast.Viewport>`. The `Toast.tsx` component will wrap `<RadixToast.Root>`. The `framer-motion` dependency can be removed from this component.

    #### **8.4. File Manifest**

    *   **To be Modified:**
        *   `src/components/Toast.tsx`
        *   `src/components/ToastContainer.tsx`
        *   `src/data/toastAtoms.ts`
        *   `src/components/Toast.module.css` (will be simplified to target Radix `data-state` attributes)