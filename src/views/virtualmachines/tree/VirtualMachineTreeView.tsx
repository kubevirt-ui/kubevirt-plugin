import React, { CSSProperties, FC, useEffect, useMemo } from 'react';

import { TREE_VIEW } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { FilterValue, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
} from '@patternfly/react-core';

import TreeViewContent from './components/TreeViewContent';
import { useHideNamespaceBar } from './hooks/useHideNamespaceBar';
import { useTreeViewData } from './hooks/useTreeViewData';
import useTreeViewSelect from './hooks/useTreeViewSelect';
import {
  CLOSED_DRAWER_SIZE,
  HIDE,
  OPEN_DRAWER_SIZE,
  PANEL_WIDTH_PROPERTY,
  SHOW,
  SHOW_TREE_VIEW,
  TREE_VIEW_LAST_WIDTH,
  TREE_VIEW_PANEL_ID,
} from './utils/constants';

import './VirtualMachineTreeView.scss';

type VirtualMachineTreeViewProps = {
  onFilterChange?: (type: string, value: FilterValue) => void;
};

const VirtualMachineTreeView: FC<VirtualMachineTreeViewProps> = ({ children, onFilterChange }) => {
  const [activeNamespace] = useActiveNamespace();

  const [drawerWidth, setDrawerWidth] = useLocalStorage(TREE_VIEW_LAST_WIDTH, OPEN_DRAWER_SIZE);
  const [drawerOpen, setDrawerOpen] = useLocalStorage(SHOW_TREE_VIEW, SHOW);

  const { featureEnabled: treeViewEnabled, loading } = useFeatures(TREE_VIEW);

  const { isSwitchDisabled, loaded, loadError, selectedTreeItem, treeData, vms } =
    useTreeViewData(activeNamespace);

  const onSelect = useTreeViewSelect(onFilterChange, vms);

  const isOpen = useMemo(() => drawerOpen === SHOW, [drawerOpen]);

  useHideNamespaceBar();
  useEffect(() => {
    const drawerPanel = document.getElementById(TREE_VIEW_PANEL_ID);
    drawerPanel?.style?.setProperty(PANEL_WIDTH_PROPERTY, drawerWidth);
  }, [drawerWidth]);

  if (loadError || (!loading && !treeViewEnabled)) return <>{children}</>;

  const toggleDrawer = () => {
    const toggleOpen = !isOpen;
    setDrawerOpen(toggleOpen ? SHOW : HIDE);

    const drawerPanel = document.getElementById(TREE_VIEW_PANEL_ID);
    const size = toggleOpen ? OPEN_DRAWER_SIZE : CLOSED_DRAWER_SIZE;
    drawerPanel.style.setProperty(PANEL_WIDTH_PROPERTY, size);
    setDrawerWidth(size);
  };

  const heightStyles: CSSProperties = {
    height: getContentScrollableElement().offsetHeight || 0,
  };

  return (
    <Drawer isExpanded isInline position="start">
      <DrawerContent
        panelContent={
          <DrawerPanelContent
            className="vms-tree-view"
            defaultSize={drawerWidth}
            id={TREE_VIEW_PANEL_ID}
            isResizable={isOpen}
            onResize={(_, width: number) => setDrawerWidth(`${String(width)}px`)}
            style={heightStyles}
          >
            <TreeViewContent
              isOpen={isOpen}
              isSwitchDisabled={isSwitchDisabled}
              loaded={loaded}
              onSelect={onSelect}
              selectedTreeItem={selectedTreeItem}
              toggleDrawer={toggleDrawer}
              treeData={treeData}
            />
          </DrawerPanelContent>
        }
      >
        <DrawerContentBody style={heightStyles}>{children}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export default VirtualMachineTreeView;
