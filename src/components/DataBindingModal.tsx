// src/components/DataBindingModal.tsx
import { useEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { Modal } from './Modal';
import { DataNavigatorView } from './DataNavigatorView';
import { SelectableListItem } from './SelectableListItem';
import {
  dataBindingRequestAtom,
  isDataBindingModalOpenAtom,
  dataBindingResultAtom,
  modalPendingSelectionAtom,
  modalSelectedNodeIdAtom,
  modalComponentSearchQueryAtom,
} from '../state/atoms';
import {
  bindingComponentGroups,
  bindingTreeData,
  BindingField,
} from '../data/dataBindingMock';
import { BindingConnectionsDropdown } from './BindingConnectionsDropdown';
import { BoundData } from '../types';
import './DataBindingModal.css';

export const DataBindingModal = () => {
  const isOpen = useAtomValue(isDataBindingModalOpenAtom);
  const [request, setRequest] = useAtom(dataBindingRequestAtom);
  const setResult = useSetAtom(dataBindingResultAtom);
  const [pendingSelection, setPendingSelection] = useAtom(modalPendingSelectionAtom);
  const setSelectedNodeId = useSetAtom(modalSelectedNodeIdAtom);
  const setSearchQuery = useSetAtom(modalComponentSearchQueryAtom);

  useEffect(() => {
    // When the modal opens, set its internal state from the request
    if (request) {
      setPendingSelection(request.currentBinding || null);
      // Reset navigation state each time
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

  const handleSelect = (component: BindingField) => {
    const selectedNode = bindingTreeData.find(n => n.id === component.path.split(' > ')[0].toLowerCase());
    const newBinding: BoundData = {
      nodeId: selectedNode?.id || '',
      nodeName: selectedNode?.name || '',
      fieldId: component.id,
      fieldName: component.name,
      path: component.path,
    };
    setPendingSelection(newBinding);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} width="456px" height="90vh">
      <div className="data-binding-modal-container">
        <div className="modal-header">
          <h3>Select Data Binding</h3>
          <button className="btn-tertiary icon-only" onClick={handleClose} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="modal-content">
          <DataNavigatorView
            treeData={bindingTreeData}
            componentData={bindingComponentGroups}
            atoms={{
              selectedNodeIdAtom: modalSelectedNodeIdAtom,
              searchQueryAtom: modalComponentSearchQueryAtom,
            }}
            renderComponentItem={(component) => (
              <SelectableListItem
                component={component as BindingField}
                isSelected={pendingSelection?.fieldId === component.id}
                onSelect={handleSelect}
              />
            )}
            renderConnectionsDropdown={(navigator, selectedNodeId) => (
                <BindingConnectionsDropdown 
                    navigator={navigator} 
                    selectedNodeId={selectedNodeId} 
                    onClose={() => navigator?.setConnectedNodeActive(false)}
                />
            )}
            showBreadcrumb={true}
          />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleUnbind}>Unbind</button>
          <div className="footer-actions-right">
            <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleApply}>Apply</button>
          </div>
        </div>
      </div>
    </Modal>
  );
};