// src/components/Accordion.tsx
import React from 'react';
import * as RadixAccordion from '@radix-ui/react-accordion';

interface AccordionProps {
  children: React.ReactNode;
  defaultValue?: string[]; // FIX: Must be an array for type="multiple"
}

interface AccordionItemProps {
  value: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export const Accordion = ({ children, defaultValue }: AccordionProps) => (
  <RadixAccordion.Root type="multiple" className="accordion-root" defaultValue={defaultValue}>
    {children}
  </RadixAccordion.Root>
);

export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, trigger, children, ...props }, forwardedRef) => (
    <RadixAccordion.Item value={value} {...props} ref={forwardedRef} className="accordion-item">
      <RadixAccordion.Header className="accordion-header">
        <RadixAccordion.Trigger className="accordion-trigger">
          {trigger}
          <span className="material-symbols-rounded accordion-chevron">expand_more</span>
        </RadixAccordion.Trigger>
      </RadixAccordion.Header>
      <RadixAccordion.Content className="accordion-content">
        <div className="accordion-content-text">{children}</div>
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  )
);