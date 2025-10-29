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
    // This component no longer needs a specific class, the parent handles it.
    <Tabs.List>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<{ value: string; children: React.ReactNode }>(child)) {
          return null;
        }

        const { value, children: tabChildren } = child.props;
        const isActive = activeValue === value;

        return (
          <Tabs.Trigger value={value} className="tab-button">
            {tabChildren}
            {isActive && (
              <motion.div
                layoutId="tab-underline"
                className="tab-underline"
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
              />
            )}
          </Tabs.Trigger>
        );
      })}
    </Tabs.List>
  );
};

export const AnimatedTabs = ({ value, onValueChange, children, isPanelTabs = false }: AnimatedTabsProps) => {
  // CRITICAL FIX: The root component now gets all the necessary classes
  // to ensure height propagation and correct styling.
  const rootClassName = `animated-tabs-root ${isPanelTabs ? 'panel-tabs' : 'tab-group'}`;

  return (
    <Tabs.Root value={value} onValueChange={onValueChange} className={rootClassName}>
      <TabList activeValue={value}>{children}</TabList>
    </Tabs.Root>
  );
};

export const Tab = ({ children }: { value: string; children: React.ReactNode }) => {
  return <>{children}</>;
};