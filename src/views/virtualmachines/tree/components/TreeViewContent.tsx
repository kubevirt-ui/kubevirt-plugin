import React, { FC, useMemo, useState } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Bullseye,
  Content,
  DrawerActions,
  DrawerHead,
  DrawerPanelBody,
  EmptyState,
  TreeView,
  TreeViewDataItem,
} from '@patternfly/react-core';

import useFilteredTreeView from '../hooks/useFilteredTreeView';
import useSelectedRowFilterTreeItems from '../hooks/useSelectedRowFilterTreeItems';
import useTreeViewItemActions from '../hooks/useTreeViewItemActions';

import TreeViewRightClickActionMenu from './TreeViewRightClickActionMenu/TreeViewRightClickActionMenu';
import CreateProject from './CreateProject';
import PanelToggleButton from './PanelToggleButton';
import TreeViewCollapseExpand from './TreeViewCollapseExpand';
import TreeViewToolbar from './TreeViewToolbar';

type TreeViewContentProps = {
  isOpen: boolean;
  isSmallScreen: boolean;
  loaded: boolean;
  onSelect: (_event: React.MouseEvent, treeViewItem: TreeViewDataItem) => void;
  selectedTreeItem: TreeViewDataItem;
  toggleDrawer: () => void;
  treeData: TreeViewDataItem[];
};

const TreeViewContent: FC<TreeViewContentProps> = ({
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
  const filteredTreeData = useFilteredTreeView(treeData);

  const selectedRowFilterTreeItems = useSelectedRowFilterTreeItems(filteredTreeData);

  const allSelectedTreeItems = useMemo(
    () => [...selectedRowFilterTreeItems, selectedTreeItem],
    [selectedRowFilterTreeItems, selectedTreeItem],
  );

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
      <TreeViewToolbar />
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
        {isEmpty(filteredTreeData) ? (
          <EmptyState
            headingLevel="h4"
            titleText={t('No projects with VirtualMachines found')}
            variant="xs"
          />
        ) : (
          <TreeView
            activeItems={allSelectedTreeItems}
            allExpanded={showAll}
            data={filteredTreeData}
            hasBadges={loaded}
            hasSelectableNodes
            onExpand={addListeners}
            onSelect={onSelect}
          />
        )}
        <TreeViewRightClickActionMenu hideMenu={hideMenu} triggerElement={triggerElement} />
      </DrawerPanelBody>
    </>
  );
};

export default TreeViewContent;
