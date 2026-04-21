import React, { FC } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import CreateProjectOnboardingPopover from '@kubevirt-utils/components/OnboardingPopover/components/CreateProjectOnboardingPopover';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Bullseye,
  DrawerPanelBody,
  EmptyState,
  Stack,
  Title,
  TreeView,
  TreeViewDataItem,
} from '@patternfly/react-core';

import useFilteredTreeView from '../hooks/useFilteredTreeView';
import useTreeViewItemActions from '../hooks/useTreeViewItemActions';
import {
  getClusterElement,
  getMatchedClusterItems,
  getMatchedProjectItems,
  highlightMatchedTreeItems,
} from '../utils/utils';

import TreeViewRightClickActionMenu from './TreeViewRightClickActionMenu/TreeViewRightClickActionMenu';
import PanelToggleButton from './PanelToggleButton';
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
  const { filteredTreeData, onSearch, searchText } = useFilteredTreeView(treeData);

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

  const filteredProjectsCount = getMatchedProjectItems(filteredTreeData, searchText).length;
  const filteredClustersCount = getMatchedClusterItems(filteredTreeData, searchText).length;

  const getSearchResultInfo = () => {
    if (filteredClustersCount && filteredProjectsCount) {
      return t('{{clustersCount}} clusters, {{projectsCount}} projects found', {
        clustersCount: filteredClustersCount,
        projectsCount: filteredProjectsCount,
      });
    }
    if (filteredClustersCount) {
      return t('{{clustersCount}} clusters found', { clustersCount: filteredClustersCount });
    }
    if (filteredProjectsCount) {
      return t('{{projectsCount}} projects found', { projectsCount: filteredProjectsCount });
    }
    return undefined;
  };

  return (
    <>
      {!isSmallScreen && panelToggleButton}
      <TreeViewToolbar onSearch={onSearch} />
      <DrawerPanelBody className="vms-tree-view-body">
        {isEmpty(filteredTreeData) ? (
          <EmptyState
            headingLevel="h6"
            titleText={t('No projects with VirtualMachines found')}
            variant="xs"
          />
        ) : (
          <Stack hasGutter>
            {searchText && (
              <Title className="pf-v6-u-text-align-center" headingLevel="h6">
                {getSearchResultInfo()}
              </Title>
            )}
            <TreeView
              activeItems={[selectedTreeItem]}
              allExpanded={searchText ? true : undefined}
              data={highlightMatchedTreeItems(filteredTreeData, searchText)}
              hasBadges={loaded}
              hasSelectableNodes
              onExpand={addListeners}
              onSelect={onSelect}
            />
          </Stack>
        )}
        <TreeViewRightClickActionMenu hideMenu={hideMenu} triggerElement={triggerElement} />
      </DrawerPanelBody>
      <CreateProjectOnboardingPopover triggerElement={getClusterElement(treeData)} />
    </>
  );
};

export default TreeViewContent;
