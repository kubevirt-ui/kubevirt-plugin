import React, { FC, MouseEvent, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { useQueryParamsMethods } from '@kubevirt-utils/components/ListPageFilter/hooks/useQueryParamsMethods';
import { convertResourceArrayToMap, getResourceUrl } from '@kubevirt-utils/resources/shared';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { FilterValue, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelBody,
  DrawerPanelContent,
  TreeView,
  TreeViewDataItem,
} from '@patternfly/react-core';
import { TEXT_FILTER_LABELS_ID } from '@virtualmachines/list/hooks/constants';

import TreeViewToolbar from './components/TreeViewToolbar';
import { useHideNamespaceBar } from './hooks/useHideNamespaceBar';
import { useSyncClicksEffects } from './hooks/useSyncClicksEffects';
import { useTreeViewData } from './hooks/useTreeViewData';
import { useTreeViewSearch } from './hooks/useTreeViewSearch';
import {
  FOLDER_SELECTOR_PREFIX,
  PROJECT_SELECTOR_PREFIX,
  TREE_VIEW_PANEL_ID,
  VM_FOLDER_LABEL,
} from './utils/constants';
import {
  createTreeViewData,
  selectedTreeItem,
  setSelectedTreeItem,
  treeViewOpen,
} from './utils/utils';

import './VirtualMachineTreeView.scss';

type VirtualMachineTreeViewProps = {
  onFilterChange?: (type: string, value: FilterValue) => void;
};

const VirtualMachineTreeView: FC<VirtualMachineTreeViewProps> = ({ children, onFilterChange }) => {
  const [activeNamespace] = useActiveNamespace();
  const navigate = useNavigate();
  const location = useLocation();

  const { setOrRemoveQueryArgument } = useQueryParamsMethods();
  const { isAdmin, loaded, loadError, projectNames, vms } = useTreeViewData();
  const vmsMapper = useMemo(() => convertResourceArrayToMap(vms, true), [vms]);

  const treeData = useMemo(
    () => createTreeViewData(projectNames, vms, activeNamespace, isAdmin, location.pathname),
    [projectNames, vms, activeNamespace, isAdmin, location.pathname],
  );

  const { filteredItems, onSearch, setShowAll, showAll } = useTreeViewSearch(treeData);

  useSyncClicksEffects(activeNamespace, loaded, location);
  useHideNamespaceBar();

  if (loadError) return <>{children}</>;

  const onSelect = (_event: MouseEvent, treeViewItem: TreeViewDataItem) => {
    setSelectedTreeItem(treeViewItem);
    onFilterChange?.(TEXT_FILTER_LABELS_ID, null);

    const treeItemName = treeViewItem.name as string;
    if (treeViewItem.id.startsWith(FOLDER_SELECTOR_PREFIX)) {
      const [_, folderNamespace] = treeViewItem.id.split('/');
      navigate(
        getResourceUrl({
          activeNamespace: folderNamespace,
          model: VirtualMachineModel,
        }),
      );
      setOrRemoveQueryArgument(TEXT_FILTER_LABELS_ID, `${VM_FOLDER_LABEL}=${treeItemName}`);
      return onFilterChange?.(TEXT_FILTER_LABELS_ID, {
        all: [`${VM_FOLDER_LABEL}=${treeItemName}`],
      });
    }

    if (treeViewItem.id.startsWith(PROJECT_SELECTOR_PREFIX)) {
      return navigate(
        getResourceUrl({
          activeNamespace: treeItemName,
          model: VirtualMachineModel,
        }),
      );
    }

    const [vmNamespace, vmName] = treeViewItem.id.split('/');
    return navigate(
      getResourceUrl({
        activeNamespace: vmNamespace,
        model: VirtualMachineModel,
        resource: vmsMapper?.[vmNamespace]?.[vmName],
      }),
    );
  };

  return (
    <Drawer isExpanded isInline position="start">
      <DrawerContent
        panelContent={
          <DrawerPanelContent
            style={{
              height: getContentScrollableElement().offsetHeight || 0,
            }}
            className="vms-tree-view"
            id={TREE_VIEW_PANEL_ID}
            isResizable={treeViewOpen.value}
          >
            <DrawerPanelBody className="vms-tree-view-body">
              <TreeView
                toolbar={
                  <TreeViewToolbar onSearch={onSearch} setShowAll={setShowAll} showAll={showAll} />
                }
                activeItems={selectedTreeItem.value}
                allExpanded={showAll}
                data={!treeViewOpen.value ? [] : filteredItems ?? treeData}
                hasBadges={loaded}
                hasSelectableNodes
                onSelect={onSelect}
              />
            </DrawerPanelBody>
          </DrawerPanelContent>
        }
      >
        <DrawerContentBody>{children}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export default VirtualMachineTreeView;
