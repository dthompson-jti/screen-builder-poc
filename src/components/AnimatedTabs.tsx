// src/components/AnimatedTabs.tsx
import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';

interface AnimatedTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  isPanelTabs?: boolean;
}

const TabList = ({ children, activeValue }: { children: React.ReactNode; activeValue: string }) => {
  return (
    <Tabs.List className="tab-list">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<{ value: string; children: React.ReactNode }>(child)) {
          return null;
        }

        const { value, children: tabChildren } = child.props;
        const isActive = activeValue === value;

        return (
          <Tabs.Trigger value={value} className={`tab-button ${isActive ? 'active' : ''}`}>
            {tabChildren}
            {isActive && (
              <motion.div
                layoutId="tab-underline"
                className="tab-underline"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
          </Tabs.Trigger>
        );
      })}
    </Tabs.List>
  );
};

export const AnimatedTabs = ({ value, onValueChange, children, isPanelTabs = false }: AnimatedTabsProps) => {
  const containerClass = isPanelTabs ? 'panel-tabs' : 'tab-group';

  return (
    <Tabs.Root value={value} onValueChange={onValueChange} className={containerClass}>
      <TabList activeValue={value}>{children}</TabList>
    </Tabs.Root>
  );
};

// Dummy component to satisfy typing and provide props to the parent.
// The `value` prop is destructured but not used, which is the intended pattern.
// The linter error is resolved by only destructuring the `children` prop.
export const Tab = ({ children }: { value: string; children: React.ReactNode }) => {
  return <>{children}</>;
};