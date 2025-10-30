// src/components/ActionToolbar.tsx
import { useRef, useLayoutEffect } from 'react';
// FIX: Removed unused type imports to resolve warnings.
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow,
} from '@floating-ui/react-dom';
import styles from './ActionToolbar.module.css';

interface ActionToolbarProps {
  children: React.ReactNode;
  mode: 'element-relative' | 'fixed';
  referenceElement?: HTMLElement | null;
}

export const ActionToolbar = ({
  children,
  mode,
  referenceElement,
}: ActionToolbarProps) => {
  const arrowRef = useRef(null);
  const {
    refs,
    floatingStyles,
  } = useFloating({
    placement: 'top',
    open: true,
    middleware:
      mode === 'element-relative'
        ? [
            offset(12),
            flip({ padding: 8 }),
            shift({ padding: 8 }),
            arrow({ element: arrowRef }),
          ]
        : [],
    whileElementsMounted:
      mode === 'element-relative' ? autoUpdate : undefined,
  });

  useLayoutEffect(() => {
    if (mode === 'element-relative' && referenceElement) {
      refs.setReference(referenceElement);
    }
  }, [refs, referenceElement, mode]);

  const isHidden = mode === 'element-relative' && !referenceElement;
  const toolbarClasses = `${styles.actionToolbar} ${
    mode === 'fixed' ? styles.fixed : ''
  } ${isHidden ? styles.hidden : ''}`;

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      className={toolbarClasses}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};