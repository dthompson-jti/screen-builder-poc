// src/components/DataBindingModal.tsx
import { useEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { Modal } from './Modal';
import { Button } from './Button';
import { DataNavigatorView } from '../features/DataNavigator/DataNavigatorView';
import { SelectableListItem } from './SelectableListItem';
import {
  dataBindingRequestAtom,
  isDataBindingModalOpenAtom,
  dataBindingResultAtom,
  modalPendingSelectionAtom,
  modalSelectedNodeIdAtom,
  modalComponentSearchQueryAtom,
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
  const [pendingSelection, setPendingSelection] = useAtom(modalPendingSelectionAtom);
  const setSelectedNodeId = useSetAtom(modalSelectedNodeIdAtom);
  const setSearchQuery = useSetAtom(modalComponentSearchQueryAtom);

  useEffect(() => {
    if (request) {
      setPendingSelection(request.currentBinding || null);
      setSelectedNodeId('arrest');
      setSearchQuery('');
    }
  }, [request, setPendingSelection, setSelectedNodeId, setSearchQuery]);

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
        <div className={styles.modalHeader}>
          <h3>Select Data Binding</h3>
          <Tooltip content="Close">
            <Button variant="quaternary" size="s" iconOnly onClick={handleClose} aria-label="Close">
              <span className="material-symbols-rounded">close</span>
            </Button>
          </Tooltip>
        </div>
        <div className={styles.modalContent}>
            <DataNavigatorView
              treeData={componentTreeData}
              componentData={componentListData}
              atoms={{
                selectedNodeIdAtom: modalSelectedNodeIdAtom,
                searchQueryAtom: modalComponentSearchQueryAtom,
              }}
              renderComponentItem={(component) => (
                <SelectableListItem
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
        </div>
        <div className={styles.modalFooter}>
          <Button variant="secondary" size="m" onClick={handleUnbind}>Unbind</Button>
          <div className={styles.footerActionsRight}>
            <Button variant="secondary" size="m" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" size="m" onClick={handleApply}>Apply</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};