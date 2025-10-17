# Project Refactoring Plan: Feature-Based Architecture

## 1. Executive Summary

The current project structure, with a flat `views` directory and several oversized components, is hindering maintainability and scalability. This plan outlines a phased refactoring to a **feature-based architecture**.

The primary goal is to colocate files related to a single "Area of Concern" into dedicated feature folders. This will improve discoverability, reduce cognitive load, and establish a clear, scalable pattern for future development. This document provides the strategic reasoning, the target folder structure, and a detailed, step-by-step guide with executable commands to perform the refactor.

## 2. Guiding Principles

1.  **Feature as a Vertical Slice**: A "feature" is a self-contained area of application functionality. It can be a full page (like Settings) or a complex, reusable UI system (like the Data Navigator). This is our "Area of Concern" principle.
2.  **Colocation is King**: All files—components, CSS modules, and even feature-specific hooks or types—should live within their parent feature's directory.
3.  **Clear Directory Roles**:
    *   `src/features/`: Contains the major, self-contained parts of the application.
    *   `src/components/`: Reserved for truly generic, application-agnostic, and highly reusable UI components (e.g., `Modal`, `Tooltip`, `Button`).
    *   `src/data/`: The single source of truth for all global state management (Jotai atoms), data-fetching hooks, mock data, and business logic.
4.  **Decisive Action**: We will perform a clean, decisive migration by renaming `src/views` to `src/features` to avoid ambiguity between old and new structures.

## 3. Proposed Final Structure

This is the target state we are working towards.

```plaintext
src/
├── App.tsx
├── main.tsx
├── index.css
├── types.ts          // (Renamed from types.txt for proper TS recognition)
│
├── components/       // GENERIC, REUSABLE UI BUILDING BLOCKS
│   ├── canvas-previews/
│   │   ├── BrowserItemPreview.tsx
│   │   ├── ContainerPreview.tsx
│   │   ├── DropdownPreview.tsx
│   │   ├── RadioButtonsPreview.tsx
│   │   └── TextInputPreview.tsx
│   │
│   ├── DataBindingPicker.tsx
│   ├── EmptyStateMessage.tsx
│   ├── Modal.tsx
│   ├── PanelHeader.tsx
│   ├── ResizablePanel.tsx
│   ├── SearchInput.tsx
│   ├── Select.tsx
│   ├── Switch.tsx
│   ├── Toast.tsx
│   ├── Tooltip.tsx
│   └── ... (and their .module.css files)
│
├── data/             // GLOBAL STATE, LOGIC, HOOKS, MOCKS (REMAINS AS-IS)
│   ├── atoms.ts
│   ├── historyAtoms.ts
│   ├── useCanvasDnd.ts
│   ├── useOnClickOutside.ts
│   ├── useUrlSync.ts
│   └── ...
│
└── features/         // MAJOR APPLICATION FEATURES
    ├── AppHeader/
    │   ├── AppHeader.tsx
    │   ├── AppHeader.module.css
    │   ├── FormNameEditor.tsx
    │   ├── FormNameMenu.tsx
    │   ├── HeaderMenu.tsx
    │   ├── ScreenTypeBadge.tsx
    │   └── ScreenTypePopover.tsx
    │
    ├── ComponentBrowser/
    │   ├── ComponentBrowser.tsx
    │   ├── GeneralComponentsBrowser.tsx
    │   └── PlaceholderPanel.tsx
    │
    ├── DataNavigator/
    │   ├── DataNavigatorView.tsx
    │   ├── ConnectionsDropdown.tsx
    │   └── ConnectionsDropdown.module.css
    │
    ├── Editor/
    │   ├── MainToolbar.tsx
    │   ├── MainToolbar.module.css
    │   └── EditorCanvas/
    │       ├── EditorCanvas.tsx
    │       ├── EditorCanvas.module.css
    │       ├── CanvasEmptyState.tsx
    │       ├── DropPlaceholder.tsx
    │       ├── FloatingSelectionToolbar.tsx
    │       ├── FormItem.tsx
    │       ├── LayoutContainer.tsx
    │       ├── SelectionToolbar.tsx
    │       └── SortableItem.tsx
    │
    ├── Preview/
    │   ├── PreviewView.tsx
    │   ├── PreviewView.module.css
    │   └── PreviewToolbar.tsx
    │
    ├── PropertiesPanel/
    │   ├── PropertiesPanel.tsx
    │   └── PropertiesPanel.module.css
    │
    └── Settings/
        ├── SettingsPage.tsx
        ├── SettingsPage.module.css
        ├── SettingsForm.tsx
        └── SettingsNavigator.tsx
```

## 4. Action Plan: Step-by-Step Execution

**Instructions:**
1.  Open a terminal in the root of your project (e.g., the integrated terminal in VS Code).
2.  Navigate into the `src` directory: `cd src`.
3.  Execute the commands for each phase. A consolidated script is provided at the end.
4.  After moving files, use VS Code's "Find and Replace" feature to update import paths. VS Code's auto-import suggestions will also be very helpful.

---

### **Phase 1: Preparation & Scaffolding**

This phase creates the new directory structure without moving or deleting existing files. It is a safe, non-breaking first step.

**1.1: Rename `types.txt` to `types.ts`**
A `.txt` file doesn't get proper language support.
```powershell
mv types.txt types.ts
```

**1.2: Create New Feature Directories**
```powershell
# Create the top-level feature folders
mkdir features
mkdir features\AppHeader
mkdir features\ComponentBrowser
mkdir features\DataNavigator
mkdir features\Editor
mkdir features\Preview
mkdir features\PropertiesPanel
mkdir features\Settings

# Create nested folders
mkdir features\Editor\EditorCanvas
mkdir components\canvas-previews
```

---

### **Phase 2: File Migration & Colocation**

This is the core of the refactor. We will move files from their old locations in `views` and `components` to their new feature homes.

**2.1: Rename `views` to `features`**
This is the single most impactful change, migrating all existing views into the new structure.
```powershell
mv views/* features/
rmdir views
```

**2.2: Colocate AppHeader Feature**
Group all components that make up the main application header.
```powershell
# Move the main component and its CSS
mv features/AppHeader.tsx features/AppHeader/
mv features/AppHeader.module.css features/AppHeader/

# Move its complex child components
mv components/FormNameEditor.tsx features/AppHeader/
mv components/FormNameEditor.module.css features/AppHeader/
mv components/FormNameMenu.tsx features/AppHeader/
mv components/HeaderMenu.tsx features/AppHeader/
mv components/HeaderMenu.module.css features/AppHeader/
mv components/ScreenTypeBadge.tsx features/AppHeader/
mv components/ScreenTypeBadge.module.css features/AppHeader/
mv components/ScreenTypePopover.tsx features/AppHeader/
```
*   **Path Updates:** In `App.tsx`, change `import { AppHeader } from './views/AppHeader'` to `import { AppHeader } from './features/AppHeader/AppHeader'`. Update relative paths within the newly moved files.

**2.3: Colocate Editor, MainToolbar, and EditorCanvas**
The "Editor" is the main workspace. It contains the toolbar and the canvas.
```powershell
# Move MainToolbar
mv features/MainToolbar.tsx features/Editor/
mv features/MainToolbar.module.css features/Editor/

# Move EditorCanvas and its dependencies
mv features/EditorCanvas.tsx features/Editor/EditorCanvas/
mv features/EditorCanvas.module.css features/Editor/EditorCanvas/
mv components/CanvasEmptyState.tsx features/Editor/EditorCanvas/
mv components/CanvasEmptyState.module.css features/Editor/EditorCanvas/
mv components/SelectionToolbar.tsx features/Editor/EditorCanvas/
mv components/SelectionToolbar.module.css features/Editor/EditorCanvas/
```
*   **Path Updates:** Update paths in `App.tsx` and within the new `Editor` feature folder.

**2.4: Colocate Remaining Features**
Move the rest of the major features into their dedicated folders.
```powershell
# Component Browsers
mv features/ComponentBrowser.tsx features/ComponentBrowser/
mv features/GeneralComponentsBrowser.tsx features/ComponentBrowser/
mv components/PlaceholderPanel.tsx features/ComponentBrowser/
mv components/PlaceholderPanel.module.css features/ComponentBrowser/

# Data Navigator
mv features/DataNavigatorView.tsx features/DataNavigator/
mv components/ConnectionsDropdown.tsx features/DataNavigator/
mv components/ConnectionsDropdown.module.css features/DataNavigator/

# Preview View
mv features/PreviewView.tsx features/Preview/
mv features/PreviewView.module.css features/Preview/
mv components/PreviewToolbar.tsx features/Preview/
mv components/PreviewToolbar.module.css features/Preview/

# Properties Panel
mv features/PropertiesPanel.tsx features/PropertiesPanel/
mv features/PropertiesPanel.module.css features/PropertiesPanel/

# Settings Page
mv features/SettingsPage.tsx features/Settings/
mv features/SettingsPage.module.css features/Settings/
mv features/SettingsForm.tsx features/Settings/
mv features/SettingsNavigator.tsx features/Settings/
```
*   **Path Updates:** This is the largest set of changes. Use VS Code's find/replace across the entire project for `from './views/` -> `from './features/...'` and `from './components/` -> `from './features/...'` where appropriate.

**2.5: Organize Canvas Previews**
These are generic components used to render previews of canvas items.
```powershell
mv components/BrowserItemPreview.tsx components/canvas-previews/
mv components/ContainerPreview.tsx components/canvas-previews/
mv components/ContainerPreview.module.css components/canvas-previews/
mv components/DropdownPreview.tsx components/canvas-previews/
mv components/RadioButtonsPreview.tsx components/canvas-previews/
mv components/RadioButtonsPreview.module.css components/canvas-previews/
mv components/TextInputPreview.tsx components/canvas-previews/
mv components/TextInputPreview.module.css components/canvas-previews/
```
*   **Path Updates:** Update imports in `App.tsx` and `EditorCanvas.tsx`.

---

### **Phase 3: Deconstruction & Cleanup**

With files in their final homes, we can now safely deconstruct the `EditorCanvas` monolith.

**3.1: Deconstruct `EditorCanvas.tsx`**
*   **Action:** Open `src/features/Editor/EditorCanvas/EditorCanvas.tsx`.
*   **Action:** For each of the following logical components within that file, create a new `.tsx` file in the same directory (`src/features/Editor/EditorCanvas/`).
    *   `FloatingSelectionToolbar` -> `FloatingSelectionToolbar.tsx`
    *   `SortableItem` -> `SortableItem.tsx`
    *   `DropPlaceholder` -> `DropPlaceholder.tsx`
    *   `LayoutContainer` -> `LayoutContainer.tsx`
    *   `FormItem` -> `FormItem.tsx`
*   **Action:** Cut the code from `EditorCanvas.tsx` and paste it into the corresponding new file. Add necessary imports and `export` statements.
*   **Action:** In `EditorCanvas.tsx`, import these new components. The file should become much smaller, primarily responsible for the overall layout and context providers.

**3.2: Final Verification**
*   **Action:** Review the `src/components/` directory one last time to ensure no feature-specific components remain.
*   **Action:** Run `npm run dev` (or your project's start command).
*   **Action:** Thoroughly test the application, paying close attention to drag-and-drop, panel visibility, and navigation, as these are areas where broken import paths are most likely to cause issues.

---

## 5. Consolidated PowerShell Script

You can copy and paste this entire block into your terminal **while in the `src/` directory** to execute all file and directory operations from Phases 1 and 2.

```powershell
# Phase 1: Preparation & Scaffolding
Write-Host "--- Phase 1: Creating new directory structure ---" -ForegroundColor Green
mv types.txt types.ts
mkdir features
mkdir features\AppHeader
mkdir features\ComponentBrowser
mkdir features\DataNavigator
mkdir features\Editor
mkdir features\Preview
mkdir features\PropertiesPanel
mkdir features\Settings
mkdir features\Editor\EditorCanvas
mkdir components\canvas-previews
Write-Host "Phase 1 Complete." -ForegroundColor Green

# Phase 2: File Migration
Write-Host "--- Phase 2: Migrating files to new feature folders ---" -ForegroundColor Yellow

# 2.1: Initial rename of views to features
Write-Host "Moving all files from /views to /features..."
Move-Item -Path views\* -Destination features\
Remove-Item -Recurse -Force views

# 2.2: AppHeader Feature
Write-Host "Colocating AppHeader feature..."
Move-Item -Path features\AppHeader.tsx -Destination features\AppHeader\
Move-Item -Path features\AppHeader.module.css -Destination features\AppHeader\
Move-Item -Path components\FormNameEditor.tsx -Destination features\AppHeader\
Move-Item -Path components\FormNameEditor.module.css -Destination features\AppHeader\
Move-Item -Path components\FormNameMenu.tsx -Destination features\AppHeader\
Move-Item -Path components\HeaderMenu.tsx -Destination features\AppHeader\
Move-Item -Path components\HeaderMenu.module.css -Destination features\AppHeader\
Move-Item -Path components\ScreenTypeBadge.tsx -Destination features\AppHeader\
Move-Item -Path components\ScreenTypeBadge.module.css -Destination features\AppHeader\
Move-Item -Path components\ScreenTypePopover.tsx -Destination features\AppHeader\

# 2.3: Editor Feature
Write-Host "Colocating Editor feature..."
Move-Item -Path features\MainToolbar.tsx -Destination features\Editor\
Move-Item -Path features\MainToolbar.module.css -Destination features\Editor\
Move-Item -Path features\EditorCanvas.tsx -Destination features\Editor\EditorCanvas\
Move-Item -Path features\EditorCanvas.module.css -Destination features\Editor\EditorCanvas\
Move-Item -Path components\CanvasEmptyState.tsx -Destination features\Editor\EditorCanvas\
Move-Item -Path components\CanvasEmptyState.module.css -Destination features\Editor\EditorCanvas\
Move-Item -Path components\SelectionToolbar.tsx -Destination features\Editor\EditorCanvas\
Move-Item -Path components\SelectionToolbar.module.css -Destination features\Editor\EditorCanvas\

# 2.4: Other Features
Write-Host "Colocating remaining features..."
Move-Item -Path features\ComponentBrowser.tsx -Destination features\ComponentBrowser\
Move-Item -Path features\GeneralComponentsBrowser.tsx -Destination features\ComponentBrowser\
Move-Item -Path components\PlaceholderPanel.tsx -Destination features\ComponentBrowser\
Move-Item -Path components\PlaceholderPanel.module.css -Destination features\ComponentBrowser\

Move-Item -Path features\DataNavigatorView.tsx -Destination features\DataNavigator\
Move-Item -Path components\ConnectionsDropdown.tsx -Destination features\DataNavigator\
Move-Item -Path components\ConnectionsDropdown.module.css -Destination features\DataNavigator\

Move-Item -Path features\PreviewView.tsx -Destination features\Preview\
Move-Item -Path features\PreviewView.module.css -Destination features\Preview\
Move-Item -Path components\PreviewToolbar.tsx -Destination features\Preview\
Move-Item -Path components\PreviewToolbar.module.css -Destination features\Preview\

Move-Item -Path features\PropertiesPanel.tsx -Destination features\PropertiesPanel\
Move-Item -Path features\PropertiesPanel.module.css -Destination features\PropertiesPanel\

Move-Item -Path features\SettingsPage.tsx -Destination features\Settings\
Move-Item -Path features\SettingsPage.module.css -Destination features\Settings\
Move-Item -Path features\SettingsForm.tsx -Destination features\Settings\
Move-Item -Path features\SettingsNavigator.tsx -Destination features\Settings\

# 2.5: Canvas Previews
Write-Host "Organizing canvas previews..."
Move-Item -Path components\BrowserItemPreview.tsx -Destination components\canvas-previews\
Move-Item -Path components\ContainerPreview.tsx -Destination components\canvas-previews\
Move-Item -Path components\ContainerPreview.module.css -Destination components\canvas-previews\
Move-Item -Path components\DropdownPreview.tsx -Destination components\canvas-previews\
Move-Item -Path components\RadioButtonsPreview.tsx -Destination components\canvas-previews\
Move-Item -Path components\RadioButtonsPreview.module.css -Destination components\canvas-previews\
Move-Item -Path components\TextInputPreview.tsx -Destination components\canvas-previews\
Move-Item -Path components\TextInputPreview.module.css -Destination components\canvas-previews\

Write-Host "--- Phase 2 Complete. Please update import paths in your editor. ---" -ForegroundColor Green
```