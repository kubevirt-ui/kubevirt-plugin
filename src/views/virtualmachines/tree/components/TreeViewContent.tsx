import React, { FC, useState } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Bullseye,
  Content,
  DrawerActions,
  DrawerHead,
  DrawerPanelBody,
  TreeView,
  TreeViewDataItem,
} from '@patternfly/react-core';

import useFilteredTreeView from '../hooks/useFilteredTreeView';
import useTreeViewItemActions from '../hooks/useTreeViewItemActions';

import TreeViewRightClickActionMenu from './TreeViewRightClickActionMenu/TreeViewRightClickActionMenu';
import CreateProject from './CreateProject';
import PanelToggleButton from './PanelToggleButton';
import TreeViewCollapseExpand from './TreeViewCollapseExpand';
import TreeViewToolbar from './TreeViewToolbar';

type TreeViewContentProps = {
  hideSwitch: boolean;
  isOpen: boolean;
  isSmallScreen: boolean;
  loaded: boolean;
  onSelect: (_event: React.MouseEvent, treeViewItem: TreeViewDataItem) => void;
  selectedTreeItem: TreeViewDataItem;
  toggleDrawer: () => void;
  treeData: TreeViewDataItem[];
};

const TreeViewContent: FC<TreeViewContentProps> = ({
  hideSwitch,
  isOpen,
  isSmallScreen,
  loaded,
  onSelect,
  selectedTreeItem,
  toggleDrawer,
  treeData,
}) => {
  const { t } = useKubevirtTranslation();
  const [showAll, setShowAll] = useState<boolean>();
  const { filteredTreeData, onSearch } = useFilteredTreeView(treeData, setShowAll);

  const { addListeners, hideMenu, triggerElement } = useTreeViewItemActions(treeData);

  if (!loaded) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }

  const panelToggleButton = <PanelToggleButton isOpen={isOpen} toggleDrawer={toggleDrawer} />;

  if (!isOpen && !isSmallScreen) {
    return panelToggleButton;
  }

  return (
    <>
      {!isSmallScreen && panelToggleButton}
      <TreeViewToolbar hideSwitch={hideSwitch} onSearch={onSearch} />
      <DrawerHead className="vms-tree-view__header-section">
        <Content className="vms-tree-view__title" component="p">
          <TreeViewCollapseExpand setShowAll={setShowAll} showAll={showAll} />
          {t('Projects')}
        </Content>
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
          onExpand={addListeners}
          onSelect={onSelect}
        />
        <TreeViewRightClickActionMenu hideMenu={hideMenu} triggerElement={triggerElement} />
      </DrawerPanelBody>
    </>
  );
};

export default TreeViewContent;
