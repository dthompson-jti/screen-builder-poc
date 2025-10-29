# IDEA: Global Status Badges in App Header

### Observation
Critical, screen-level settings like "API Enabled" and "Read Only" are currently configured as switches on the `Settings` page. This vital context is completely hidden when the user is in the main `Editor` or `Preview` views.

### Problem
A user might be making edits without realizing the screen is, for example, "Read Only" or not "API Enabled", leading to confusion. There is no at-a-glance confirmation of the screen's core status.

### Proposal
1.  **Create a `StatusBadge` Component:** Build a new, reusable, high-craft component at `src/components/StatusBadge.tsx`. It should accept props like `icon`, `label`, `tooltip`, and `variant` (e.g., 'info', 'warning').
2.  **Integrate into Header:** In `AppHeader.tsx`, render these status badges in a consistent location, such as next to the `FormNameEditor`.
3.  **State-Driven Visibility:** Use the existing global atoms (`isApiEnabledAtom`, `isReadOnlyAtom`) to conditionally render the badges. For example, the "Read Only" badge only appears if `isReadOnlyAtom` is `true`.

### Rationale
This change significantly improves the user's situational awareness by surfacing critical screen context in a persistent, global location. It also adds a valuable and reusable high-craft component to the project's design system.