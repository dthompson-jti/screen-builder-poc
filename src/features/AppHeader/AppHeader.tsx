// src/features/AppHeader/AppHeader.tsx
import { useAtom } from 'jotai';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  isMenuOpenAtom,
  appViewModeAtom,
  AppViewMode,
} from '../../data/atoms';
import { HeaderMenu } from './HeaderMenu';
import { FormNameEditor } from './FormNameEditor';
import { ScreenTypeBadge } from './ScreenTypeBadge';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
import { AnimatedTabs, Tab } from '../../components/AnimatedTabs';
import styles from './AppHeader.module.css';

export const AppHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useAtom(isMenuOpenAtom);
  const [viewMode, setViewMode] = useAtom(appViewModeAtom);

  const handleTabClick = (mode: AppViewMode) => {
    setViewMode(mode);
  };

  return (
    <header className={styles.appHeader}>
      <div className={styles.headerLeft}>
        <DropdownMenu.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <Tooltip content="Toggle Menu">
            <DropdownMenu.Trigger asChild>
              <Button
                variant="tertiary"
                size="s"
                iconOnly
                aria-label="Toggle Menu"
              >
                <span className="material-symbols-rounded">menu</span>
              </Button>
            </DropdownMenu.Trigger>
          </Tooltip>
          <HeaderMenu />
        </DropdownMenu.Root>

        <h1 className={styles.appHeaderTitle}>Screen Studio</h1>
        <div className={styles.verticalDivider} />
        <div className={styles.formIdentifier}>
          <div className={styles.screenIdentifier}>
            <ScreenTypeBadge />
          </div>
          <FormNameEditor />
        </div>
      </div>

      <div className={styles.headerCenter}>
        <AnimatedTabs value={viewMode} onValueChange={(v) => handleTabClick(v as AppViewMode)}>
          <Tab value="editor">Edit</Tab>
          <Tab value="preview">Preview</Tab>
          <Tab value="settings">Settings</Tab>
        </AnimatedTabs>
      </div>

      <div className={styles.headerRight}>
        <Button variant="primary" size="m">Save</Button>
        <Button variant="secondary" size="m">Close</Button>
      </div>
    </header>
  );
};