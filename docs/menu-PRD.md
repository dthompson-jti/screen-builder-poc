Of course. You are absolutely right. The previous plan captured the structure but missed the crucial variants and states shown in the new design image. A complete specification must include these details.

Here is the updated, comprehensive plan for Phase 1, incorporating all variants (standard, destructive, toggle, flyout) across all states (rest, hover, focus, disabled) as depicted in the image.

---

## Phase 1 Plan (Revised): MenuItem & SelectItem Component System

This plan details the complete visual and structural specifications for all menu and select item variants. The core principle is a shared layout structure with modifiers for different types and states.

### 1. Shared Layout & Structure

All menu item variants will share a consistent internal flexbox structure to ensure perfect alignment of all elements.

```ascii
+-------------------------------------------------+
|  [L]   Label Text                 [Shortcut]  [R] |
+-------------------------------------------------+
   <->   <---------------------->   <-------->  <->
    A              B                    C         D
```

*   **A: Left Slot (`.menu-item__left`):** `width: 20px`. Contains the checkmark or icon.
*   **B: Center Label (`.menu-item__center`):** `flex-grow: 1`. Contains the main text label.
*   **C: Shortcut (`.menu-item__shortcut`):** Variable width, right-aligned.
*   **D: Right Slot (`.menu-item__right`):** `width: 20px`. Contains the flyout chevron.
*   **Spacing:** A consistent `gap` (e.g., `12px`) will be used between visible elements.
*   **Container (`.menu-item`):** `padding: 8px`, `border-radius: 8px`.

---

### 2. `MenuItem` Variants (for `DropdownMenu` & `ContextMenu`)

#### **A. Standard Action (`role="menuitem"`)**

*   **Rest State:**
    *   **Container:** `background-color: var(--surface-bg-primary)`.
    *   **Icon (Slot A):** `color: var(--surface-fg-tertiary)`.
    *   **Typography:**
        *   **Label (B):** `color: var(--surface-fg-secondary)`, `font-weight: 600`.
        *   **Shortcut (C):** `color: var(--surface-fg-quaternary)`, `font-weight: 500`.

*   **Hover State (`[data-highlighted]`)**
    *   **Container:** `background-color: var(--control-bg-tertiary-hover)`.
    *   **Icon (Slot A):** `color: var(--surface-fg-secondary)`.
    *   **Typography:**
        *   **Label (B):** `color: var(--surface-fg-primary)`.
        *   **Shortcut (C):** `color: var(--surface-fg-secondary)`.

*   **Focus-Visible State (`[data-highlighted]:focus-visible`)**
    *   **Container:** `background-color: var(--surface-bg-primary)` (Note: No grey background), `box-shadow: 0 0 0 2px var(--control-focus-ring-standard)`.
    *   *Icon and Typography colors remain in their rest state.*

*   **Disabled State (`[data-disabled]`)**
    *   **Container:** `cursor: not-allowed`, `background-color: transparent`.
    *   **Icon (Slot A):** `color: var(--control-fg-disabled-faint)`.
    *   **Typography (All):** `color: var(--control-fg-disabled-faint)`.

---

#### **B. Destructive Action (`role="menuitem"`, `.menu-item--destructive`)**

*   **Rest State:**
    *   **Container:** `background-color: var(--surface-bg-primary)`.
    *   **Icon (Slot A):** `color: var(--surface-fg-alert-primary)`.
    *   **Typography:**
        *   **Label (B):** `color: var(--surface-fg-alert-primary)`.
        *   **Shortcut (C):** `color: var(--surface-fg-alert-primary)`.

*   **Hover State (`[data-highlighted]`)**
    *   **Container:** `background-color: var(--surface-bg-error-solid)` (Solid Red).
    *   **Icon (Slot A):** `color: var(--control-fg-on-solid)` (White).
    *   **Typography (All):** `color: var(--control-fg-on-solid)` (White).

*   **Focus-Visible State (`[data-highlighted]:focus-visible`)**
    *   **Container:** `background-color: var(--surface-bg-primary)`, `box-shadow: 0 0 0 2px var(--control-focus-ring-error)`.
    *   *Icon and Typography colors remain in their red rest state.*

*   **Disabled State (`[data-disabled]`)**
    *   *Identical to the Standard Action Disabled state (all elements are muted grey).*

---

#### **C. Toggle Item (`role="menuitemcheckbox"`)**

This variant behaves identically to the **Standard Action** for Hover, Focus, and Disabled states. Its only unique property is its checked state.

*   **Checked State (`[data-state="checked"]`)**
    *   **Icon (Slot A):** A `check` icon is rendered. `color: var(--control-fg-selected)`.
*   **Unchecked State (`[data-state="unchecked"]`)**
    *   **Icon (Slot A):** Is empty, but preserves the `20px` width for alignment.

---

#### **D. Flyout / Sub-menu Trigger**

This variant behaves identically to the **Standard Action** for all states. Its only unique properties are its content.

*   **Content:**
    *   **Icon (Slot A):** Typically has no icon.
    *   **Shortcut (Slot C):** Has no shortcut.
    *   **Chevron (Slot D):** Renders a `chevron_right` icon. `color` follows the same state rules as a standard icon (e.g., `var(--surface-fg-tertiary)` at rest).

---

### 3. `SelectItem` Component (for `Select` / Listbox)

The `SelectItem` is for **value selection**, not actions. Therefore, it will **only have the Standard variant**. It does not have destructive, toggle (it has "selected" instead), or flyout variants. Its purpose is to look like a standard menu item.

*   **Rest, Hover, Focus, Disabled States:**
    *   These states are visually and functionally **identical to the `MenuItem` Standard Action** to ensure consistency.
    *   It will target the Radix Select attributes (`[data-highlighted]`, `[data-disabled]`, etc.).

*   **Selected State (`[data-state="checked"]`)**
    *   This is the key difference. It indicates the currently chosen value in the listbox.
    *   **Icon (Slot A):** A `check` icon is rendered via `<RadixSelect.ItemIndicator>`. `color: var(--control-fg-selected)`.
    *   **Container & Typography:** Remain in their default rest state. The checkmark is the sole indicator of selection.