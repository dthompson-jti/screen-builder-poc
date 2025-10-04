// src/components/ScreenTypePopover.tsx
import { useRef } from 'react';
import { useSetAtom } from 'jotai';
import { ScreenType, isScreenTypePopoverOpenAtom, screenTypeAtom } from '../data/atoms';
import { screenTypeConfig, screenTypeOptions } from '../data/screenTypeConfig';
import { useOnClickOutside } from '../data/useOnClickOutside';
import headerMenuStyles from './HeaderMenu.module.css';

const PopoverMenuItem = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button className="menu-item" onClick={onClick}>
    <span className="checkmark-container" />
    <span>{label}</span>
  </button>
);

export const ScreenTypePopover = () => {
  const setIsOpen = useSetAtom(isScreenTypePopoverOpenAtom);
  const setScreenType = useSetAtom(screenTypeAtom);
  const popoverRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(popoverRef, () => setIsOpen(false));

  const handleSelect = (type: ScreenType) => {
    setScreenType(type);
    setIsOpen(false);
  };

  return (
    <div
      ref={popoverRef}
      className={headerMenuStyles.headerMenuPopover}
      style={{ top: 'calc(100% + 8px)', width: '200px' }}
    >
      {screenTypeOptions.map(type => (
        <PopoverMenuItem
          key={type}
          label={screenTypeConfig[type].label}
          onClick={() => handleSelect(type)}
        />
      ))}
    </div>
  );
};