// src/features/ComponentBrowser/ComponentBrowser.tsx
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { DataNavigatorView } from '../DataNavigator/DataNavigatorView';
import { DraggableListItem } from './DraggableListItem';
import { ActionToolbar } from '../../components/ActionToolbar';
import { Button } from '../../components/Button';
import { Tooltip } from '../../components/Tooltip';
import { isComponentBrowserVisibleAtom, selectedCanvasComponentIdsAtom } from '../../data/atoms';
import { componentTreeData, componentListData } from '../../data/componentBrowserMock';
import { selectedNodeIdAtom, componentSearchQueryAtom } from '../../data/atoms';
import { dataNavigatorSelectedIdsAtom, dataNavigatorSelectionAnchorIdAtom } from './dataNavigatorAtoms';
import { commitActionAtom, rootComponentIdAtom, canvasComponentsByIdAtom } from '../../data/historyAtoms';
import { DraggableComponent } from '../../types';
import { ConnectionsDropdown } from '../DataNavigator/ConnectionsDropdown';
import panelStyles from '../../components/panel.module.css';

export const ComponentBrowser = () => {
  const setIsPanelVisible = useSetAtom(isComponentBrowserVisibleAtom);
  const [selectedNavIds, setSelectedNavIds] = useAtom(dataNavigatorSelectedIdsAtom);
  const setAnchorId = useSetAtom(dataNavigatorSelectionAnchorIdAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const canvasSelectedIds = useAtomValue(selectedCanvasComponentIdsAtom);
  const allCanvasComponents = useAtomValue(canvasComponentsByIdAtom);
  const rootId = useAtomValue(rootComponentIdAtom);

  const atoms = {
    selectedNodeIdAtom: selectedNodeIdAtom,
    searchQueryAtom: componentSearchQueryAtom,
  };

  const determineTargetParentId = (): string => {
    if (canvasSelectedIds.length === 1) {
      const component = allCanvasComponents[canvasSelectedIds[0]];
      if (component && component.componentType === 'layout') {
        return component.id;
      }
    }
    return rootId;
  };

  const handleAddMultiple = () => {
    if (selectedNavIds.length === 0) return;
    
    const allAvailableComponents = Object.values(componentListData).flat().flatMap(g => g.components);
    const componentsToAdd = selectedNavIds
      .map(id => allAvailableComponents.find(c => c.id === id))
      .filter((c): c is DraggableComponent => !!c);

    if (componentsToAdd.length > 0) {
      const targetParentId = determineTargetParentId();
      commitAction({
        action: {
          type: 'COMPONENTS_ADD_BULK',
          payload: { componentsToAdd, targetParentId },
        },
        message: `Add ${componentsToAdd.length} fields`,
      });
      setSelectedNavIds([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedNavIds([]);
    setAnchorId(null);
  };

  return (
    <DataNavigatorView
      treeData={componentTreeData}
      componentData={componentListData}
      atoms={atoms}
      renderComponentItem={(component, list) => (
        <DraggableListItem
          key={component.id}
          component={component}
          list={list}
        />
      )}
      renderConnectionsDropdown={(navigator, selectedNodeId, onClose) => (
        <ConnectionsDropdown 
            navigator={navigator} 
            selectedNodeId={selectedNodeId} 
            onClose={onClose}
        />
      )}
      onClosePanel={() => setIsPanelVisible(false)}
      showBreadcrumb={true}
      onClearSelection={handleClearSelection}
    >
      <AnimatePresence>
        {selectedNavIds.length > 1 && (
          <motion.div
            className={panelStyles.multiSelectToolbarWrapper}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
          >
            <ActionToolbar>
              {/* FIX: Moved clear selection button to the far left for consistency. */}
              <Tooltip content="Clear selection">
                <Button variant="on-solid" size="s" iconOnly onClick={handleClearSelection} aria-label="Clear selection">
                  <span className="material-symbols-rounded">close</span>
                </Button>
              </Tooltip>
              <span className={panelStyles.floatingToolbarText}>{selectedNavIds.length} selected</span>
              <div className={panelStyles.floatingToolbarDivider} />
              <Button variant="on-solid" size="m" onClick={handleAddMultiple}>
                Add Fields
              </Button>
            </ActionToolbar>
          </motion.div>
        )}
      </AnimatePresence>
    </DataNavigatorView>
  );
};