// src/features/AppHeader/ScreenTypeBadge.tsx
import { useAtom } from 'jotai';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { screenTypeAtom, ScreenType } from '../../data/atoms';
import { screenTypeConfig, screenTypeOptions } from '../../data/screenTypeConfig';
import { Tooltip } from '../../components/Tooltip';
import styles from './ScreenTypeBadge.module.css';

export const ScreenTypeBadge = () => {
  const [screenType, setScreenType] = useAtom(screenTypeAtom);

  const { label, tooltip } = screenTypeConfig[screenType];

  const handleSelect = (type: ScreenType) => {
    setScreenType(type);
  };

  return (
    <DropdownMenu.Root>
      <Tooltip content={tooltip} side="bottom">
        <DropdownMenu.Trigger asChild>
          <button className={styles.badge}>
            {label}
          </button>
        </DropdownMenu.Trigger>
      </Tooltip>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="popover-content"
          style={{ minWidth: 200, padding: 'var(--spacing-1)' }}
          sideOffset={5}
        >
          {screenTypeOptions.map(type => (
            <DropdownMenu.Item
              key={type}
              className="menu-item"
              onSelect={() => handleSelect(type)}
            >
              <span className="checkmark-container" />
              <span>{screenTypeConfig[type].label}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};