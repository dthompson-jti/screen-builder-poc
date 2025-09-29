# Navigator & Breadcrumb Specification

This document outlines the product, UX/UI, and architectural requirements for the Data Navigator and Breadcrumb components within the Screen Studio application. The primary goal is to provide a "rock solid," intuitive, and high-craft user experience for navigating complex hierarchical data.

---

## 1. Product Requirements Document (PRD)

### 1.1. Introduction & Vision

Users need to navigate a potentially deep and wide entity relationship model to find and use data fields. The Data Navigator and Breadcrumb components are the primary tools for this task. They must transform a complex action into a simple, clear, and predictable experience. The core vision is to provide a navigation system that feels as stable and reliable as a physical device, eliminating ambiguity and inspiring user confidence.

### 1.2. User Stories

*   **As a form designer, I want to** see my exact location within the data hierarchy at all times, **so that** I always have context for the fields I am seeing.
*   **As a form designer, I want to** move one level up (back) or one level down (forward) in the hierarchy with a single click, **so that** I can explore relationships efficiently.
*   **As a form designer, I want to** jump back multiple levels in the hierarchy instantly, **so that** I can change context without repetitive clicking.
*   **As a form designer, I want to** see how many items are connected to my currently selected data entity, **so that** I can understand the scope of available data.
*   **As a form designer, I want** the navigation interface to be completely predictable and free of visual glitches, **so that** I can trust the tool and focus on my design task.

### 1.3. Functional Requirements

| Feature ID | Requirement Description |
| :--- | :--- |
| NAV-01 | The **Data Navigator** shall display three distinct node slots: "Last node," "Selected node," and "Connections." |
| NAV-02 | The **Last node** button shall navigate the context one level backward in the hierarchy. This button must be disabled when at the root level of the hierarchy. |
| NAV-03 | The **Selected node** button shall display the name of the current data entity. It is a non-interactive display element. |
| NAV-04 | The **Connections** button shall function as an action button for the Selected node. It must display an accurate, dynamically calculated count of all available connections (Entities, Collections, Transients). |
| NAV-05 | Clicking the **Connections** button shall open a dropdown menu containing all connected items, categorized and searchable. |
| NAV-06 | The **Breadcrumb** shall display the full, ordered path from the root to the Selected node. |
| NAV-07 | Each segment of the Breadcrumb (except the last) shall be a clickable button that navigates the context directly to that point in the hierarchy. |
| NAV-08 | The **Dropdown Menu** shall allow users to select a navigable item to move one level forward in the hierarchy. |

### 1.4. Non-Functional Requirements

| Feature ID | Requirement Description |
| :--- | :--- |
| NFR-01 | **Performance:** All navigation animations must be fluid (target 60fps) and complete within approximately 0.4 seconds. |
| NFR-02 | **Clarity & Stability:** The interface must be free of visual artifacts, race conditions, or "glimpses" of incorrect data during state transitions. The user experience must feel "rock solid." |
| NFR-03 | **Accessibility:** All interactive elements (buttons, links) must have appropriate `aria-label` attributes for screen readers. |

---

## 2. UX/UI Specification

### 2.1. General Principles

*   **Visual Consistency:** All components must adhere to the established Design System, using the defined color, spacing, typography, and shadow tokens.
*   **Motion Language:** Animations should be purposeful and consistent. The primary motion is a horizontal "conveyor belt" slide. Text state changes use a clean "cross-fade." Breadcrumb transitions use a "fade-and-slide."
*   **State Clarity:** All interactive elements must have visually distinct `default`, `hover`, `active`/`pressed`, and `disabled` states. Non-interactive elements must not have interactive states.

### 2.2. Component Specification

#### Node Buttons

*   **Last Node / Connections Button:**
    *   **Default:** Secondary button style.
    *   **Hover:** Secondary button hover style (subtle background change, bottom shadow).
    *   **Active/Pressed:** Secondary button pressed style (darker background, inset shadow, 1px vertical shift).
*   **Selected Node Button:**
    *   **Default:** Selected button style (theme color fill and border).
    *   **Interaction:** This element is **non-interactive**. It **must not** have a hover or active state. Its visual appearance shall not change on mouseover.

#### Connector Arrows

*   **Appearance:** A single, right-pointing arrow shall connect the "Last" to "Selected" and "Selected" to "Connections" nodes.
*   **Style:** The arrow line and head shall have a stroke weight of **1.5px**.
*   **Color:** `var(--surface-fg-tertiary)`.
*   **Spacing:** The arrow line shall have `8px` of clear space from the edge of the buttons on both sides.

### 2.3. Animation Specification

The animation protocol is the most critical part of this specification and must be followed precisely to ensure a "rock solid" experience.

#### Forward Navigation (e.g., Clicking "Connections" Dropdown Item)

1.  **Phase 0 (Pre-Animation - Instantaneous):**
    *   The `navigate` event fires immediately to trigger concurrent animations (like the breadcrumb).
    *   The text of the current **Connections Button** is instantly **blanked**.
    *   The node *that is currently off-screen to the right* and is about to slide into view is located, and its text is also instantly **blanked**.
2.  **Phase 1 (The Slide - 0.4s):**
    *   The track container animates horizontally to the left.
    *   The node sliding into the "Connections" slot does so **while blank**.
    *   All other visible nodes retain their correct, static `name` text throughout the slide.
3.  **Phase 2 (Post-Animation - ~0.2s):**
    *   The slide completes. The DOM is re-ordered and the layout is reset.
    *   A new cross-fade animation begins *only* on the new, blank Connections Button:
        *   The new, accurate connection count text (e.g., `"4 connections"`) is set with `opacity: 0`.
        *   The text fades in to `opacity: 1`.

#### Backward Navigation (e.g., Clicking "Last Node" or Breadcrumb)

1.  **Phase 0 (Pre-Animation - Instantaneous):**
    *   The `navigate` event fires immediately.
    *   The text of the current **Connections Button** is instantly **blanked**.
2.  **Phase 1 (The Slide - 0.4s):**
    *   The track container animates horizontally to the right.
    *   The now-blank Connections Button slides out of view.
    *   All other nodes retain their correct, static text throughout the slide.
3.  **Phase 2 (Post-Animation - ~0.2s):**
    *   The slide completes. The DOM is re-ordered and the layout is reset.
    *   A new cross-fade animation begins on the new Connections Button to reveal its accurate connection count, fading in from `opacity: 0` to `1`.

#### Breadcrumb Animation

*   **Enter (Navigating Forward):** A new breadcrumb segment fades in while sliding into place from the right.
*   **Exit (Navigating Backward):** The removed breadcrumb segment(s) fade out while sliding away to the right.

---

## 3. Example POC Architecture

This section outlines a sample architecture for implementing the specified behavior in the context of this Proof of Concept.

### 3.1. Key Principles

*   **Centralized State Management:** The application's navigation state is managed in a central, reactive store (e.g., Jotai). The `selectedNodeId` atom serves as the single source of truth for the entire component tree's context. This prevents state inconsistencies and prop-drilling.
*   **Component Decoupling:** The complex animation logic is encapsulated within a vanilla JavaScript class (`NodeNavigator.js`). The main React component (`ComponentBrowser.tsx`) acts as an orchestrator, managing state and listening for DOM events dispatched by the `NodeNavigator` instance. This separation of concerns allows the animation logic to be debugged in isolation from the React lifecycle.
*   **Authoritative Animation Timeline:** A powerful animation library (GSAP) is used for its robust timeline features. This is critical for explicitly sequencing the multi-phase animations and preventing the race conditions that cause visual glitches.

### 3.2. Data Flow

The interaction follows a clear, unidirectional flow:

1.  **User Interaction:** User clicks a button (`Last Node`, Breadcrumb, Dropdown item).
2.  **React Handler:** The React `onClick` handler calls the appropriate method on the `NodeNavigator` instance (e.g., `instance.navigateToId('case')`).
3.  **Animation Control (`NodeNavigator.js`):**
    *   The `navigateToId` method takes full control.
    *   It performs all **Phase 0 (Pre-Animation)** DOM manipulations instantly (e.g., blanking text).
    *   It dispatches a `navigate` event back to the DOM.
    *   It constructs and runs the GSAP timeline for the **Phase 1 (Slide)** animation.
    *   The GSAP timeline's `onComplete` callback executes all **Phase 2 (Post-Animation)** logic, including the final text cross-fade.
4.  **State Update (`ComponentBrowser.tsx`):**
    *   The component's `useEffect` hook listens for the `navigate` event.
    *   Upon receiving the event, it updates the central Jotai atom (`setSelectedNodeId`).
5.  **React Re-render:**
    *   The state change triggers a re-render of components subscribed to the atom (e.g., the Breadcrumb and the component list), ensuring they reflect the new context.

### 3.3. Component Breakdown

*   `**ComponentBrowser.tsx**`: The "smart" container. It initializes the `NodeNavigator`, manages the Jotai state, and renders the UI based on that state.
*   `**NodeNavigator.js**`: The "dumb" but powerful animation engine. It knows nothing about React or Jotai. Its sole responsibility is to manipulate its given DOM elements and execute flawless, sequential animations based on the provided data structure.
*   `**browserAtoms.ts**`: Defines the `selectedNodeId` atom, the single source of truth for navigation state.
*   `**mockComponentTree.ts**`: The data source. Critically, the `componentTreeData` (which includes connection counts) is dynamically generated from the `connectionsDropdownData` to ensure data integrity.