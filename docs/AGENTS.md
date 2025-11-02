# Agent Charter & Execution Protocol

This document defines the operating protocol for AI agents working on the Screen Studio codebase. Its purpose is to maximize the probability of a correct, complete, and architecturally sound "one-shot" outcome for any given task.

## Prime Directive: One-Shot Excellence

The agent's primary goal is to deliver a complete and correct solution in a single response, minimizing the need for iterative correction. This is achieved by adhering to three pillars:

1.  **Holistic Analysis:** Before writing code, the agent must ingest and synthesize **all** provided context: the user's request, the PRD, the project `README.md`, `CSS-PRINCIPLES.md`, and all relevant existing code files. The agent must build a complete mental model of the system's current state and the desired future state.
2.  **Internal Simulation:** The agent must mentally "execute" the proposed changes and simulate their impact. This involves walking through the code paths, anticipating cascading effects (e.g., how changing a component's structure will affect its CSS), and pre-emptively identifying potential bugs, race conditions, or architectural violations.
3.  **Comprehensive Delivery:** A "one-shot" response is not just code. It is a complete solution package, including all necessary file operations, code modifications, documentation updates, and a strategic verification plan.

## Standard Execution Algorithm (Internal)

For any non-trivial task (e.g., implementing a PRD), the agent must follow this internal thought process *before* generating the final output:

1.  **Ingestion & Synthesis:**
    *   Read and fully comprehend the entire user request and all context files.
    *   Identify the core problem statement and the key success criteria ("Definition of Done").
    *   Cross-reference the request with the architectural principles in `README.md`.

2.  **Impact Analysis & Dependency Mapping:**
    *   Create a definitive list of all files that will be **Created, Read, Updated, or Deleted (CRUD)**.
    *   Map the dependencies. For example: "Updating the component renderers will require changes in `CanvasNode.tsx` and `DndDragOverlay.tsx`." This prevents leaving dependent files in a broken state.

3.  **Virtual Refactoring (The Mental Walkthrough):**
    *   Simulate the changes in the most critical files first.
    *   **Example Simulation:** *"I will create a unified renderer with a `selectableWrapper`. The old CSS targeted `.selected > .formComponentWrapper`. This selector will fail. Therefore, I must update `EditorCanvas.module.css` to target `.selectableWrapper.selected` to prevent a visual regression."*
    *   **Example Simulation:** *"I will add a hover effect to `.selectableWrapper`. Since these wrappers can be nested, this will cause a hover-bubbling bug. The correct solution is to make the wrapper itself invisible and apply the hover styles to its direct child, ensuring only the top-most element appears hovered."*
    *   **Example Simulation (Cross-Contamination):** *"I am modifying `useEditorHotkeys`. This is a global hook. Does it run in Preview Mode? Yes. Will the hotkeys I'm adding have unintended consequences in a read-only view? Yes, the user could delete components from the preview. Therefore, I must add a guard clause at the top of my event handler: `if (viewMode !== 'editor') return;` to prevent this architectural leak."*
    *   This is the most critical step. The agent must act as its own QA engineer, actively trying to "break" its own plan.

4.  **Code Generation & Self-Correction:**
    *   Generate the full code for all modified files.
    *   Perform a final pass over the generated code, checking it against the **Technical Mandates** listed below. This is a fast, final check for common, known errors.


## Technical Mandates & Known Pitfalls

These are non-negotiable rules learned from the project's history. Violating them will result in rework.

1.  **The Rules of Hooks are Absolute.** All React Hooks (`useRef`, `useState`, `useAtomValue`, etc.) **must** be called unconditionally at the top level of a component. Never place a hook call inside a conditional block (`if/else`), loop, or nested function. If a component has different logic paths, hoist all hooks to the top.

2.  **`dnd-kit` Refs are Setters.** The `ref` provided by `useSortable` is a function (`(node) => void`), not a `RefObject`. It cannot be accessed with `.current`. To get a stable reference to a sortable element for other purposes (e.g., positioning a toolbar), create a separate `useRef` and use a merged ref setter function: `const setMergedRefs = (node) => { localRef.current = node; sortableRef(node); }`.

3.  **`dnd-kit` Clicks Require `activationConstraint` Delay.** If a draggable item also needs to be clickable (`onClick`, multi-select, etc.), the `PointerSensor` **must** be configured with a reasonable `delay` in its `activationConstraint` (e.g., `{ delay: 150, tolerance: 5 }`). Without a delay, the sensor is too sensitive and will immediately capture the `mousedown` event to initiate a drag, preventing the `click` event from ever firing. This is the root cause of "buttons not working" on draggable items.

4.  **CSS Selectors Must Match the Final DOM.** When refactoring a component's JSX structure, the corresponding CSS Module **must** be updated. The agent is responsible for ensuring selectors for states like `:hover` and `.selected` target the new, correct class names and element hierarchy.

5.  **Solve Nested Hovers with Child Targeting.** To prevent the "hover bubbling" effect on nested components, the interactive wrapper (`.selectableWrapper`) should be stylistically invisible. The visual feedback (`background-color`, `border-color`) must be applied to its **direct child** (e.g., `.selectableWrapper:hover > .formItemContent`).

6.  **Precision in Imports is Mandatory.** All package names must be exact (e.g., `@dnd-kit/core`, `@floating-ui/react-dom`). All relative paths must be correct. There is no room for typos.

7.  **"Ghost Errors" are Real.** If the user reports errors for files that have been deleted, the agent's first diagnostic step is to instruct the user to **restart the VS Code TypeScript Server**. This resolves stale cache issues.

8.  **Editor Systems Must Be View-Aware.** Any hook or system that provides editor-specific functionality (e.g., `useEditorHotkeys`, `useEditorInteractions`) **must** be conditionally disabled if the application's view mode is not `'editor'`. Failure to do so will cause editor logic to leak into read-only views like "Preview," breaking the user experience. Always check the `appViewModeAtom` as a guard clause.