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

export const AnimatedTabs = ({ value, onValueChange, children, isPanelTabs = false }: AnimatedTabsProps) => {
  const containerClass = `animated-tabs-root ${isPanelTabs ? 'panel-tabs' : 'tab-group'}`;

  return (
    <Tabs.Root value={value} onValueChange={onValueChange} className={containerClass}>
      {/* 
        DEFINITIVE FIX: <Tabs.List> must be a DIRECT child of <Tabs.Root> to establish the
        React Context connection required by Radix UI. The previous <TabList> wrapper component
        broke this connection, causing the conditional rendering logic to fail. All logic
        is now correctly placed inside the required Radix structure.
      */}
      <Tabs.List className="" >
        {React.Children.map(children, (child) => {
          if (!React.isValidElement<{ value: string; children: React.ReactNode }>(child)) {
            return null;
          }

          const childValue = child.props.value;
          const isActive = value === childValue;

          return (
            <Tabs.Trigger value={childValue} className="tab-button">
              {child.props.children}
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
    </Tabs.Root>
  );
};

// This component is a pure data carrier. Its only job is to hold props
// for the parent to read. It renders nothing itself.
export const Tab = ({ children }: { value: string; children: React.ReactNode }) => {
  return <>{children}</>;
};