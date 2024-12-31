import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DrawerActions,
  DrawerHead,
  DrawerPanelBody,
  Text,
  TreeView,
  TreeViewDataItem,
} from '@patternfly/react-core';

import UseFilteredTreeView from '../hooks/UseFilteredTreeView';

import CreateProject from './CreateProject';
import PanelToggleButton from './PanelToggleButton';
import TreeViewCollapseExpand from './TreeViewCollapseExpand';
import TreeViewToolbar from './TreeViewToolbar';

type TreeViewContentProps = {
  isOpen: boolean;
  isSwitchDisabled: boolean;
  loaded: boolean;
  onSelect: (_event: React.MouseEvent, treeViewItem: TreeViewDataItem) => void;
  selectedTreeItem: TreeViewDataItem;
  toggleDrawer: () => void;
  treeData: TreeViewDataItem[];
};

const TreeViewContent: FC<TreeViewContentProps> = ({
  isOpen,
  isSwitchDisabled,
  loaded,
  onSelect,
  selectedTreeItem,
  toggleDrawer,
  treeData,
}) => {
  const { t } = useKubevirtTranslation();
  const [showAll, setShowAll] = useState<boolean>();
  const { filteredTreeData, onSearch } = UseFilteredTreeView(treeData, setShowAll);

  if (!isOpen) {
    return (
      <PanelToggleButton
        className="vms-tree-view__action"
        isOpen={isOpen}
        toggleDrawer={toggleDrawer}
      />
    );
  }

  return (
    <>
      <TreeViewToolbar
        closeComponent={
          <PanelToggleButton
            className="vms-tree-view__close-button"
            isOpen={isOpen}
            toggleDrawer={toggleDrawer}
          />
        }
        isSwitchDisabled={isSwitchDisabled}
        onSearch={onSearch}
      />
      <DrawerHead className="vms-tree-view__header-section">
        <Text className="vms-tree-view__title">
          <TreeViewCollapseExpand setShowAll={setShowAll} showAll={showAll} />
          {t('Projects')}
        </Text>
        <DrawerActions>
          <CreateProject />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody className="vms-tree-view-body">
        <TreeView
          activeItems={[selectedTreeItem]}
          allExpanded={showAll}
          data={filteredTreeData}
          hasBadges={loaded}
          hasSelectableNodes
          onSelect={onSelect}
        />
      </DrawerPanelBody>
    </>
  );
};

export default TreeViewContent;
