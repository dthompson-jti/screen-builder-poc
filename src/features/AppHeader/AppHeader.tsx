// src/features/AppHeader/AppHeader.tsx
import { useAtom, useAtomValue } from 'jotai';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { isMenuOpenAtom, appViewModeAtom, AppViewMode } from '../../data/atoms';
import { formNameAtom } from '../../data/historyAtoms';
import { HeaderMenu } from './HeaderMenu';
import { FormNameMenu } from './FormNameMenu';
import { Button } from '../../components/Button';
import { AnimatedTabs, Tab } from '../../components/AnimatedTabs';
import styles from './AppHeader.module.css';

export const AppHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useAtom(isMenuOpenAtom);
  const formName = useAtomValue(formNameAtom);
  const [viewMode, setViewMode] = useAtom(appViewModeAtom);

  return (
    <header className={styles.appHeader}>
      <div className={styles.left}>
        {/* Hamburger Menu */}
        <div className={styles.menuWrapper}>
             <Button 
               variant="quaternary" 
               size="m" 
               iconOnly 
               onClick={() => setIsMenuOpen(!isMenuOpen)}
               aria-label="Main menu"
             >
                <span className="material-symbols-rounded">menu</span>
             </Button>
             {isMenuOpen && <HeaderMenu />}
        </div>

        <div className={styles.divider} />

        <span className={styles.appTitle}>Screen Studio</span>
        <span className={styles.badge}>Case Initiation</span>

        <div className={styles.divider} />

        {/* Screen Name Dropdown */}
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className={styles.screenNameTrigger}>
                    <span>{formName}</span>
                    <span className="material-symbols-rounded">expand_more</span>
                </button>
            </DropdownMenu.Trigger>
            <FormNameMenu onRename={() => { /* Todo: Connect to rename logic */ }} />
        </DropdownMenu.Root>
      </div>

      <div className={styles.center}>
          {/* View Mode Toggle - No className needed, component is self-contained */}
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