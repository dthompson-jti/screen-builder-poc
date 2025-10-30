// src/components/DataBindingModal.tsx
import { useEffect, useState } from 'react';
import { useAtom, useSetAtom, useAtomValue, atom } from 'jotai';
import { Modal } from './Modal';
import { Button } from './Button';
import { DataNavigatorView } from '../features/DataNavigator/DataNavigatorView';
import { SelectableListItem } from './SelectableListItem';
import {
  dataBindingRequestAtom,
  isDataBindingModalOpenAtom,
  dataBindingResultAtom,
} from '../data/atoms';
import {
  componentListData,
  componentTreeData,
} from '../data/componentBrowserMock';
import { ConnectionsDropdown } from '../features/DataNavigator/ConnectionsDropdown';
import { Tooltip } from './Tooltip';
import { BoundData, DraggableComponent } from '../types';
import styles from './DataBindingModal.module.css';

export const DataBindingModal = () => {
  const isOpen = useAtomValue(isDataBindingModalOpenAtom);
  const [request, setRequest] = useAtom(dataBindingRequestAtom);
  const setResult = useSetAtom(dataBindingResultAtom);
  
  // State scoped to the modal
  const [pendingSelection, setPendingSelection] = useState<BoundData | null>(null);
  const [modalAtoms] = useState(() => ({
    selectedNodeIdAtom: atom('arrest'),
    searchQueryAtom: atom(''),
  }));
  const setSelectedNodeId = useSetAtom(modalAtoms.selectedNodeIdAtom);
  const setSearchQuery = useSetAtom(modalAtoms.searchQueryAtom);

  useEffect(() => {
    if (request) {
      setPendingSelection(request.currentBinding || null);
      // Reset modal state when it opens with a new request
      setSelectedNodeId('arrest');
      setSearchQuery('');
    }
  }, [request, setSelectedNodeId, setSearchQuery]);

  const handleClose = () => {
    setRequest(null);
  };

  const handleApply = () => {
    if (!request) return;
    setResult({
      componentId: request.componentId,
      newBinding: pendingSelection,
    });
    handleClose();
  };
  
  const handleUnbind = () => {
    if (!request) return;
    setResult({
      componentId: request.componentId,
      newBinding: null,
    });
    handleClose();
  };

  const handleSelect = (component: DraggableComponent) => {
    if (!component.nodeId || !component.nodeName || !component.path) return;
    
    const newBinding: BoundData = {
      nodeId: component.nodeId,
      nodeName: component.nodeName,
      fieldId: component.id,
      fieldName: component.name,
      path: component.path,
    };
    setPendingSelection(newBinding);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} width="600px" height="90vh">
      <div className={styles.dataBindingModalContainer}>
        <Modal.Header>
          <h3>Select Data Binding</h3>
          <Tooltip content="Close">
            <Button variant="quaternary" size="s" iconOnly onClick={handleClose} aria-label="Close">
              <span className="material-symbols-rounded">close</span>
            </Button>
          </Tooltip>
        </Modal.Header>
        <Modal.Content>
          <DataNavigatorView
            treeData={componentTreeData}
            componentData={componentListData}
            atoms={modalAtoms}
            renderComponentItem={(component) => (
              // FIX: Removed unused `list` prop to resolve warning.
              <SelectableListItem
                key={component.id}
                component={component}
                isSelected={pendingSelection?.fieldId === component.id}
                onSelect={handleSelect}
              />
            )}
            renderConnectionsDropdown={(navigator, selectedNodeId, onClose) => (
                <ConnectionsDropdown 
                    navigator={navigator} 
                    selectedNodeId={selectedNodeId} 
                    onClose={onClose}
                />
            )}
            showBreadcrumb={true}
            isInsideModal={true}
            autoFocusSearch={true}
          />
        </Modal.Content>
        <Modal.Footer>
          <Button variant="secondary" size="m" onClick={handleUnbind}>Unbind</Button>
          <div className={styles.footerActionsRight}>
            <Button variant="secondary" size="m" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" size="m" onClick={handleApply}>Apply</Button>
          </div>
        </Modal.Footer>
      </div>
    </Modal>
  );
};