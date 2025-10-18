Of course. Here is the consolidated PRD, UI/UX Specification, and Technical Architecture Specification in a single markdown file.

---

# **Feature Spec: Enhanced Canvas Drag & Drop**
*   **Version:** 3.0
*   **Date:** October 18, 2025
*   **Status:** Finalized

## 1. PRD (Product Requirements Document)

### 1.1. Feature Overview
This document outlines an enhancement to the canvas drag-and-drop experience. The feature introduces intelligent drop zones in the canvas background area to make reordering components, specifically to the beginning and end of the form, faster, more forgiving, and more intuitive for the user. It also includes a high-craft auto-scroll behavior to ensure the result of a user's action is always visible.

### 1.2. Problem Statement
When building or reordering long forms, moving a component to the very top or very bottom of the list is a common but cumbersome action. The user is required to precisely scroll and hover over a small target area at the edge of the list. Dragging a component into the ample empty space around the form currently does nothing, which feels like a missed opportunity for a more intuitive interaction. Furthermore, if a new component is added to the bottom of a long form that requires scrolling, the user receives no immediate visual confirmation, as the new item is off-screen.

### 1.3. User Stories
*   "As a user, when I'm reordering components, I want to quickly move an item to the **top** of the form by simply dragging it into the space above the form, without needing to aim for the first component."
*   "As a user, I want to add a component to the **end** of the form by dragging it into the empty space to the left, right, or bottom of the form card."
*   "As a user, when I add a new component to the end of a long form, I expect the canvas to **automatically scroll down** so I can see the new component I just added."

### 1.4. Business Goals
*   **Increase User Satisfaction:** Create a fluid, "it just works" experience that delights users and makes the tool feel powerful and intuitive.
*   **Reduce User Friction:** Decrease the time and precision required to perform common layout tasks, improving overall workflow efficiency.
*   **Enhance Competitive Standing:** Implement best-in-class UX patterns seen in leading design and productivity tools.

### 1.5. Scope
#### In-Scope
*   Creating two invisible drop zones on the canvas background: a "top zone" and a "main/bottom zone".
*   Implementing the logic to move a dragged component to the top (index 0) or bottom (`children.length`) of the root form container.
*   Displaying clear visual feedback: a highlight on the form card and a precise line indicator showing the drop location.
*   Implementing a smooth, interruptible auto-scroll to reveal newly added components at the bottom of a scrolled canvas.
*   The feature applies to dragging both new components from the browser and existing components on the canvas.

#### Out-of-Scope
*   Applying this behavior to nested layout containers (background drops will *always* target the root container for this version).
*   Scenarios with multiple forms on a single canvas.
*   Customizable drop zone sizes or behaviors.

---

## 2. UI & UX Specification

### 2.1. Interaction Model
The canvas background will be treated as an intelligent drop area, conceptually divided into two zones.

#### **Top Drop Zone**
*   **Area:** A horizontal band across the top of the canvas viewport, with a fixed height of `32px` (`--spacing-8`).
*   **Trigger:** The user drags a component so their cursor enters this top band while over the gray canvas background.
*   **Result:** The component will be placed at the **beginning** of the main form's list.

#### **Bottom Drop Zone**
*   **Area:** Any part of the gray canvas background that is *not* the Top Drop Zone. This includes the left/right margins and the main area below the top 32px band.
*   **Trigger:** The user drags a component into this area.
*   **Result:** The component will be placed at the **end** of the main form's list.

### 2.2. Visual Feedback

#### **Form Highlight**
*   While a component is being dragged over *either* the Top or Bottom background drop zone, the entire form card will display a distinct blue outline (`2px`, using `--control-border-selected`). This provides immediate, macro-level feedback that the form itself is the drop target.

#### **Drop Indicator (`DropPlaceholder`)**
*   The line indicator will provide precise, micro-level feedback simultaneously with the form highlight.
*   **Top Drop:** A `4px` tall blue line will appear inside the form card, positioned directly *above* the first component.
*   **Bottom Drop:** The line will appear directly *below* the last component.
*   **Empty Canvas:** If the form has no components, the form card will display a block-style indicator (a dashed blue outline with a light blue background), filling the content area.

#### **Auto-Scroll Behavior**
*   **Trigger:** When a `COMPONENT_ADD` action places a new component at the end of the root form's children list.
*   **Action:** The canvas will initiate a smooth, animated scroll to bring the newly added component into view.
*   **Animation Details:** The scroll will have a duration of `~0.7s` with a gentle ease (`power2.inOut`) for a professional feel. It will stop with a slight offset (`100px`) from the bottom of the viewport so the new component is not flush with the edge of the screen.
*   **User Interruption:** If the user manually scrolls at any point during the animation, the auto-scroll will be immediately cancelled, returning full control to the user.

---

## 3. Technical Architecture & Implementation Plan

### 3.1. Overview
The feature will be implemented by centralizing logic within our existing `dnd-kit` infrastructure. We will make the canvas background a single `droppable` entity. The core logic in the `useCanvasDnd` hook will be enhanced to interpret drops on this background, using viewport-relative coordinates to determine a "top" or "bottom" action. A new event-driven, "write-only" Jotai atom (`scrollRequestAtom`) will be created to cleanly trigger the auto-scroll, which will be executed by a new, reusable `useAutoScroller` hook leveraging GSAP for a high-quality animation.

### 3.2. File-by-File Implementation Details

#### **1. `atoms.ts` (State Definition)**
*   **Action:** Define a new "write-only" atom to signal a scroll request. This decouples the action's *intent* from the view's *implementation*.
*   **Code:**
    ```typescript
    // An event-like atom. The value is an object with the target componentId or null.
    export const scrollRequestAtom = atom<{ componentId: string } | null>(null);
    ```

#### **2. `historyAtoms.ts` (Action Logic)**
*   **Action:** Modify the `commitActionAtom` reducer to dispatch a scroll request when appropriate.
*   **Code:** Inside the `'COMPONENT_ADD'` case of the reducer:
    ```typescript
    // After adding the new component to presentState.components...
    const parent = presentState.components[parentId];
    // Check if the component was added to the end of the root container
    if (parentId === presentState.rootComponentId && index === parent.children.length - 1) {
      // Set the scrollRequestAtom with the ID of the new component
      set(scrollRequestAtom, { componentId: newId });
    }
    ```

#### **3. `useAutoScroller.ts` (New File - Scroll Logic)**
*   **Action:** Create a new custom hook to encapsulate all scrolling logic and effects.
*   **Code:**
    ```typescript
    // src/data/useAutoScroller.ts
    import { useEffect, RefObject } from 'react';
    import { useAtom } from 'jotai';
    import { scrollRequestAtom } from './atoms';
    import { gsap } from 'gsap';
    import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

    gsap.registerPlugin(ScrollToPlugin);

    export const useAutoScroller = (scrollContainerRef: RefObject<HTMLElement>) => {
      const [scrollRequest, setScrollRequest] = useAtom(scrollRequestAtom);

      useEffect(() => {
        if (scrollRequest && scrollContainerRef.current) {
          const targetElement = document.querySelector(`[data-id="${scrollRequest.componentId}"]`);
          if (targetElement) {
            gsap.to(scrollContainerRef.current, {
              duration: 0.7,
              scrollTo: { y: targetElement, offsetY: 100 },
              ease: 'power2.inOut',
            });
          }
          // Reset the atom to consume the event
          setScrollRequest(null);
        }
      }, [scrollRequest, setScrollRequest, scrollContainerRef]);
    };
    ```

#### **4. `EditorCanvas.tsx` (Integration)**
*   **Action:** Register the background as a drop zone and integrate the auto-scroll hook.
*   **Implementation:**
    1.  Define a constant for the background ID: `const CANVAS_BACKGROUND_ID = '--canvas-background--';`
    2.  Instantiate `useDroppable`: `const { setNodeRef, isOver: isOverBackground } = useDroppable({ id: CANVAS_BACKGROUND_ID });`
    3.  Instantiate `useRef` for the scroll container and call the new hook:
        ```typescript
        const canvasContainerRef = useRef<HTMLDivElement>(null);
        useAutoScroller(canvasContainerRef);
        ```
    4.  Apply the ref and conditional class to the JSX:
        ```jsx
        <div ref={canvasContainerRef} className={styles.canvasContainer} /*...*/>
          <div ref={setNodeRef} style={{width: '100%', height: '100%', position: 'absolute'}} /> // Invisible drop layer
          <div className={`${styles.formCard} ${isOverBackground ? styles.isBackgroundTarget : ''}`} /*...*/>
            {/* ... form content ... */}
          </div>
        </div>
        ```
    *Note: An invisible, absolutely positioned div is used to receive the `setNodeRef` to ensure the drop zone covers the entire container without interfering with its padding or flex properties.*

#### **5. `EditorCanvas.module.css` (Styling)**
*   **Action:** Add the CSS for the form highlight effect.
*   **Code:**
    ```css
    .formCard.isBackgroundTarget {
      border-color: var(--control-border-selected);
      box-shadow: var(--surface-shadow-lg), 0 0 0 2px var(--control-border-selected);
    }
    ```

#### **6. `useCanvasDnd.ts` (Core Drag Logic)**
*   **Action:** Update the `getDropTarget` function to handle the new background drop zone.
*   **Implementation:**
    1.  Add a primary `if` condition to detect a drop on the background.
    2.  Define the `topZoneHeight = 32;`.
    3.  Check `draggingRect.top` against `topZoneHeight` to determine `isTopDrop`.
    4.  Calculate the `targetIndex` based on `isTopDrop` (0 or `root.children.length`).
    5.  Calculate the `viewportRect` for the line indicator by finding the first or last child DOM element and positioning the indicator rect above or below it. Handle the empty case by returning `null`.
    6.  Return the final target object: `{ parentId: 'root', index: targetIndex, viewportRect, isGrid: false }`.

### 3.3. Risk Analysis & Mitigation
*   **Risk:** User confusion from the spatial disconnect (e.g., dropping left makes an item appear at the bottom).
    *   **Mitigation:** The strong, immediate visual feedback (form highlight + line indicator) is designed to make the outcome clear *before* the drop, teaching the user the interaction model instantly.
*   **Risk:** Logic breaking on long, scrolled forms.
    *   **Mitigation:** The drop zone logic is based on the **viewport's** coordinate system (`draggingRect.top < 32`), not the document's. This makes the interaction consistent and independent of the form's height or scroll position.
*   **Risk:** Future conflicts if multiple forms are allowed on the canvas.
    *   **Mitigation:** This is an accepted risk for the current scope. The logic is centralized, making it straightforward to refactor later to target the "closest" form if needed.
*   **Risk:** The auto-scroll animation could feel jarring or uncontrollable.
    *   **Mitigation:** We are using GSAP's `ScrollToPlugin`, which is user-interruptible by default. If the user scrolls manually, the animation stops. The easing and duration are chosen to feel smooth and intentional, not robotic.