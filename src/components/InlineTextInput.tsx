// src/components/InlineTextInput.tsx
// NEW FILE
import { useSetAtom } from 'jotai';
import { activelyEditingComponentIdAtom } from '../data/atoms';
import { commitActionAtom } from '../data/historyAtoms';
import { useEditable } from '../data/useEditable';
import styles from './EditableText.module.css';

interface InlineTextInputProps {
  componentId: string;
  initialValue: string;
}

/**
 * Renders an input field for in-place editing of a component's label.
 * It uses the useEditable hook to manage its state and interactions.
 */
export const InlineTextInput = ({ componentId, initialValue }: InlineTextInputProps) => {
  const setActivelyEditingId = useSetAtom(activelyEditingComponentIdAtom);
  const commit = useSetAtom(commitActionAtom);

  const handleCommit = (newValue: string) => {
    commit({
      action: {
        type: 'COMPONENT_UPDATE_FORM_PROPERTIES',
        payload: { componentId, newProperties: { label: newValue } },
      },
      message: `Rename label to "${newValue}"`,
    });
    setActivelyEditingId(null); // Exit editing mode
  };

  const handleCancel = () => {
    setActivelyEditingId(null); // Exit editing mode
  };

  const { ref, ...inputProps } = useEditable(initialValue, handleCommit, handleCancel);

  return (
    <input
      ref={ref}
      type="text"
      className={styles.inlineInput}
      {...inputProps}
      // Prevent dnd-kit from capturing clicks on the input itself and starting a drag
      onMouseDown={(e) => e.stopPropagation()}
    />
  );
};