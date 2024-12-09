import React, { FC, MouseEvent, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { useQueryParamsMethods } from '@kubevirt-utils/components/ListPageFilter/hooks/useQueryParamsMethods';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { convertResourceArrayToMap, getResourceUrl } from '@kubevirt-utils/resources/shared';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { FilterValue, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  Drawer,
  DrawerActions,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Title,
  Tooltip,
  TreeView,
  TreeViewDataItem,
} from '@patternfly/react-core';
// import { PanelCloseIcon, PanelOpenIcon } from '@patternfly/react-icons';
import { TEXT_FILTER_LABELS_ID } from '@virtualmachines/list/hooks/constants';

import TreeViewToolbar from './components/TreeViewToolbar';
import { useHideNamespaceBar } from './hooks/useHideNamespaceBar';
import { useSyncClicksEffects } from './hooks/useSyncClicksEffects';
import { useTreeViewData } from './hooks/useTreeViewData';
import { useTreeViewSearch } from './hooks/useTreeViewSearch';
import ClosePanelIcon from './icons/ClosePanelIcon';
import CollapseAllIcon from './icons/CollapseAllIcon';
import ExpandAllIcon from './icons/ExpandAllIcon';
import OpenPanelIcon from './icons/OpenPanelIcon';
import {
  CLOSED_DRAWER_SIZE,
  FOLDER_SELECTOR_PREFIX,
  HIDE,
  OPEN_DRAWER_SIZE,
  PANEL_WIDTH_PROPERTY,
  PROJECT_SELECTOR_PREFIX,
  SHOW,
  SHOW_TREE_VIEW,
  TREE_VIEW_LAST_WIDTH,
  TREE_VIEW_PANEL_ID,
  VM_FOLDER_LABEL,
} from './utils/constants';
import {
  createTreeViewData,
  filterDefaultNamespaceItems,
  selectedTreeItem,
  setSelectedTreeItem,
} from './utils/utils';

import './VirtualMachineTreeView.scss';

type VirtualMachineTreeViewProps = {
  onFilterChange?: (type: string, value: FilterValue) => void;
};

const VirtualMachineTreeView: FC<VirtualMachineTreeViewProps> = ({ children, onFilterChange }) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const navigate = useNavigate();
  const location = useLocation();
  const { setOrRemoveQueryArgument } = useQueryParamsMethods();
  const [drawerWidth, setDrawerWidth] = useLocalStorage(TREE_VIEW_LAST_WIDTH, OPEN_DRAWER_SIZE);
  const [drawerOpen, setDrawerOpen] = useLocalStorage(SHOW_TREE_VIEW, SHOW);

  const {
    isAdmin,
    loaded,
    loadError,
    projectNames,
    setShowDefaultProjects,
    showDefaultProjects,
    vms,
  } = useTreeViewData();

  const vmsMapper = useMemo(() => convertResourceArrayToMap(vms, true), [vms]);

  const treeData = useMemo(
    () => createTreeViewData(projectNames, vms, activeNamespace, isAdmin, location.pathname),
    [projectNames, vms, activeNamespace, isAdmin, location.pathname],
  );

  const { filteredItems, onSearch, setShowAll, showAll } = useTreeViewSearch(treeData);

  const drawerPanel = document.getElementById(TREE_VIEW_PANEL_ID);
  const isOpen = drawerOpen === SHOW;

  useSyncClicksEffects(activeNamespace, loaded, location);
  useHideNamespaceBar();
  useEffect(() => {
    drawerPanel?.style?.setProperty(PANEL_WIDTH_PROPERTY, drawerWidth);
  }, [drawerPanel, drawerWidth]);

  const filteredTreeData = useMemo(() => {
    if (!isOpen) return [];

    const items = filteredItems ?? treeData;
    if (showDefaultProjects === HIDE) {
      return items
        .map((opt) => Object.assign({}, opt))
        .filter((item) => filterDefaultNamespaceItems(item));
    }

    return items;
  }, [filteredItems, showDefaultProjects, treeData, isOpen]);

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

  const toggleDrawer = () => {
    const toggleOpen = !isOpen;
    setDrawerOpen(toggleOpen ? SHOW : HIDE);

    const size = toggleOpen ? OPEN_DRAWER_SIZE : CLOSED_DRAWER_SIZE;
    drawerPanel.style.setProperty(PANEL_WIDTH_PROPERTY, size);
    setDrawerWidth(size);
  };

  const onResize = (
    _e: globalThis.MouseEvent | React.KeyboardEvent | TouchEvent,
    width: number,
  ) => {
    setDrawerWidth(`${String(width)}px`);
  };
  const togglePanelButton = (
    <Tooltip content={isOpen ? t('Close') : t('Open')}>
      <Button
        className="vms-tree-view-toolbar-action"
        onClick={toggleDrawer}
        variant={ButtonVariant.plain}
      >
        {isOpen ? <ClosePanelIcon /> : <OpenPanelIcon />}
      </Button>
    </Tooltip>
  );

  return (
    <Drawer isExpanded isInline position="start">
      <DrawerContent
        panelContent={
          <DrawerPanelContent
            style={{
              height: getContentScrollableElement().offsetHeight || 0,
            }}
            className="vms-tree-view"
            defaultSize={drawerWidth}
            id={TREE_VIEW_PANEL_ID}
            isResizable={isOpen}
            onResize={onResize}
          >
            {!isOpen ? (
              togglePanelButton
            ) : (
              <>
                <TreeViewToolbar
                  isOpen={isOpen}
                  onSearch={onSearch}
                  setShowDefaultProjects={setShowDefaultProjects}
                  showDefaultProjects={showDefaultProjects}
                />
                <DrawerHead>
                  <Title headingLevel="h6">{t('Projects')}</Title>
                  <DrawerActions>
                    <Tooltip content={showAll ? t('Collapse all') : t('Expand all')}>
                      <Button
                        className="vms-tree-view-toolbar-action"
                        onClick={() => setShowAll((prev) => !prev)}
                        variant={ButtonVariant.plain}
                      >
                        {showAll ? <CollapseAllIcon /> : <ExpandAllIcon />}
                      </Button>
                    </Tooltip>
                    {togglePanelButton}
                  </DrawerActions>
                </DrawerHead>
                <DrawerPanelBody className="vms-tree-view-body">
                  <TreeView
                    activeItems={selectedTreeItem.value}
                    allExpanded={showAll}
                    data={filteredTreeData}
                    hasBadges={loaded}
                    hasSelectableNodes
                    onSelect={onSelect}
                  />
                </DrawerPanelBody>
              </>
            )}
          </DrawerPanelContent>
        }
      >
        <DrawerContentBody>{children}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export default VirtualMachineTreeView;
