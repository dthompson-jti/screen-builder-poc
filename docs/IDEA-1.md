# IDEA: Decouple Form Field 'Name' from 'Label'

### Observation
Currently, when a user edits a form component's **Label** in the properties panel, the programmatic **Field Name** is automatically re-generated and overwritten.

### Problem
This behavior tightly couples the display representation (the user-facing label) with the data representation (the stable field name used in logic and APIs). This is problematic because:
1.  Minor copy edits to a label can break the data contract of the form.
2.  It prevents developers from having a simple, stable `fieldName` (e.g., `arrestDate`) while using a more descriptive `label` (e.g., "Date of Arrest / Apprehension").

### Proposal
1.  **Refactor `handleLabelChange`:** In `FormEditor.tsx`, modify the `handleLabelChange` function to *only* update the `label` property in the component's state.
2.  **Expose `fieldName`:** Add a new, separate input field in the "Data" or "Field Settings" accordion for "Field Name". This input should be editable.
3.  **(Optional Enhancement)** Add a "sync" or "derive" icon button next to the "Field Name" input. When clicked, it would populate the field name based on the current value of the label, giving the user control over this action.

### Rationale
This change provides a more professional and robust experience. It decouples display from data, which is a fundamental best practice in form design, leading to more stable and predictable forms.