// src/features/AppHeader/AppHeader.tsx
import { useAtom } from 'jotai';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { appViewModeAtom, AppViewMode } from '../../data/atoms';
import { HeaderMenu } from './HeaderMenu';
import { FormNameEditor } from './FormNameEditor';
import { ScreenTypeBadge } from './ScreenTypeBadge';
import { Button } from '../../components/Button';
import { AnimatedTabs, Tab } from '../../components/AnimatedTabs';
import styles from './AppHeader.module.css';

export const AppHeader = () => {
  const [viewMode, setViewMode] = useAtom(appViewModeAtom);

  return (
    <header className={styles.appHeader}>
      <div className={styles.left}>
        {/* Hamburger Menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="tertiary" /* Changed to tertiary */
              size="m"
              iconOnly
              aria-label="Main menu"
            >
              <span className="material-symbols-rounded">menu</span>
            </Button>
          </DropdownMenu.Trigger>
          <HeaderMenu />
        </DropdownMenu.Root>

        <div className={styles.divider} />

        <span className={styles.appTitle}>Screen Studio</span>
        <ScreenTypeBadge />

        <div className={styles.divider} />
        
        <FormNameEditor />
      </div>

      <div className={styles.center}>
          {/* View Mode Toggle */}
          <AnimatedTabs value={viewMode} onValueChange={(val) => setViewMode(val as AppViewMode)}>
              <Tab value="editor">Edit</Tab>
              <Tab value="preview">Preview</Tab>
              <Tab value="settings">Settings</Tab>
          </AnimatedTabs>
      </div>

      <div className={styles.right}>
        <Button variant="primary" size="m">Save</Button>
        <Button variant="secondary" size="m">Close</Button>
      </div>
    </header>
  );
};