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
          className="menu-popover"
          style={{ minWidth: 200 }}
          sideOffset={5}
        >
          {screenTypeOptions.map(type => (
            <DropdownMenu.CheckboxItem
              key={type}
              className="menu-item"
              checked={screenType === type}
              onSelect={() => handleSelect(type)}
            >
              <span className="checkmark-container">
                <DropdownMenu.ItemIndicator>
                  <span className="material-symbols-rounded">check</span>
                </DropdownMenu.ItemIndicator>
              </span>
              <span>{screenTypeConfig[type].label}</span>
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};