# Styling Architecture Guide

This project uses a **hybrid CSS architecture** that combines the predictability of global utility styles with the safety and scope of CSS Modules. This approach provides a robust and scalable foundation for building a high-craft user interface.

## 1. The Three Layers of CSS

The styling system is organized into three distinct layers, controlled by the `@layer` rule in `src/index.css`. This layering is critical because it defines the order of precedence, ensuring that more specific styles always override more general ones.

The layers are loaded in this order:
1.  **`base`**: Foundational design tokens and global utilities.
2.  **`components`**: Styles for specific, complex components.
3.  **(unlayered)**: CSS Modules, which have the highest specificity by default.

### Layer 1: The `base` Layer (Global Utilities)

Files in this layer define the visual language of the application. They are intentionally global and should be composed together to build UIs.

*   **`src/design-tokens.css`**: **The single source of truth for all visual primitives.** Contains all `--color-`, `--spacing-`, and `--shadow-` variables. All other stylesheets should reference these tokens.
*   **`src/buttons.css`**: Defines global button classes like `.btn`, `.btn-primary`, etc. These classes control appearance (color, padding, border) but **not** layout (margin, position).
*   **`src/forms.css`**: Defines base styles for standard form elements like `input[type="text"]`, `textarea`, and custom controls like checkboxes and switches.
*   **`src/menu.css`**, **`src/tabs.css`**: Defines styles for other common, reusable UI patterns.
*   **`src/scrollbars.css`**: Provides globally consistent scrollbar styling.

**Rule:** These files are imported **only once** in `src/index.css` into the `base` layer. **Never import them directly into a component.**

### Layer 2: The `components` Layer (Data-Driven Appearance)

This layer is for styles that are applied globally but are more specific than base utilities.

*   **`src/views/appearance.css`**: A key file that uses data attributes to apply appearance styles (e.g., `[data-appearance-type="primary"]`). This allows the `FormRenderer` and `EditorCanvas` to share the exact same styling logic for component appearance without duplicating CSS.

### Layer 3: Unlayered (CSS Modules)

This is the default and most common way to style components in the project.

*   **Pattern:** For any component (`MyComponent.tsx`), create a co-located style file named `MyComponent.module.css`.
*   **Scoping:** The Vite build process automatically transforms class names in `.module.css` files to be unique (e.g., `.title` becomes `.MyComponent_title__aB12c`). This **guarantees** that a component's styles will never conflict with any other styles in the application.

**Usage:**

```tsx
// In src/components/MyComponent.tsx
import styles from './MyComponent.module.css';

const MyComponent = () => {
  // The 'styles.container' class is uniquely scoped to this component.
  return <div className={styles.container}>Hello</div>;
};
```

## 2. Combining Global and Scoped Styles

The power of this system comes from combining the layers. A component can use its own scoped layout styles while leveraging the global utility classes for its appearance.

**Best Practice:** Use template literals to combine classes.

```tsx
// A button inside a component's specific layout.
import styles from './MyFeature.module.css';

const MyFeature = () => {
  // Use a global '.btn' class for appearance
  // and a scoped '.myCustomButton' class for layout (e.g., margin).
  const buttonClasses = `btn btn-primary ${styles.myCustomButton}`;

  return <button className={buttonClasses}>Submit</button>;
};
```

This approach provides the best of both worlds:
*   **Consistency:** The look of all primary buttons is defined in one place (`buttons.css`).
*   **Encapsulation:** The layout and positioning of this specific button are safely managed within its component's scope, preventing side effects.