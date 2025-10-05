// src/components/DataBindingModal.tsx
import { useEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { Modal } from './Modal';
import { DataNavigatorView } from '../views/DataNavigatorView';
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
import { ConnectionsDropdown } from './ConnectionsDropdown';
import { BoundData, DraggableComponent } from '../types';
import styles from './DataBindingModal.module.css'; // FIX: Import the new dedicated styles

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
    <Modal isOpen={isOpen} onClose={handleClose} width="456px" height="90vh">
      {/* FIX: Apply the new flexbox layout classes to the modal structure */}
      <div className={styles.dataBindingModalContainer}>
        <div className={styles.modalHeader}>
          <h3>Select Data Binding</h3>
          <button className="btn btn-tertiary icon-only" onClick={handleClose} aria-label="Close">
            <span className="material-symbols-rounded">close</span>
          </button>
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
                  component={component as DraggableComponent}
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
            />
        </div>
        <div className={styles.modalFooter}>
          <button className="btn btn-secondary" onClick={handleUnbind}>Unbind</button>
          <div className={styles.footerActionsRight}>
            <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleApply}>Apply</button>
          </div>
        </div>
      </div>
    </Modal>
  );
};