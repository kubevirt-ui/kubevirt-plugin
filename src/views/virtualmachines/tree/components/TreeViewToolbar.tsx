import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Tooltip,
  TreeViewSearch,
} from '@patternfly/react-core';
import { PanelCloseIcon, PanelOpenIcon } from '@patternfly/react-icons';

import {
  CLOSED_DRAWER_SIZE,
  OPEN_DRAWER_SIZE,
  PANEL_WIDTH_PROPERTY,
  TREE_VIEW_PANEL_ID,
  TREE_VIEW_SEARCH_ID,
} from '../utils/constants';
import { treeViewOpen } from '../utils/utils';

type TreeViewToolbarProps = {
  onSearch: (event: ChangeEvent<HTMLInputElement>) => void;
  setShowAll: Dispatch<SetStateAction<boolean>>;
  showAll: boolean;
};

const TreeViewToolbar: FC<TreeViewToolbarProps> = ({ onSearch, setShowAll, showAll }) => {
  const { t } = useKubevirtTranslation();

  const toggleDrawer = () => {
    treeViewOpen.value = !treeViewOpen.value;
    const panel = document.getElementById(TREE_VIEW_PANEL_ID);
    panel.style.setProperty(
      PANEL_WIDTH_PROPERTY,
      treeViewOpen.value ? OPEN_DRAWER_SIZE : CLOSED_DRAWER_SIZE,
    );
  };

  return (
    <Toolbar className="vms-tree-view-toolbar">
      <ToolbarContent className="vms-tree-view-toolbar-content">
        <ToolbarItem>
          {treeViewOpen.value && (
            <TreeViewSearch
              id={TREE_VIEW_SEARCH_ID}
              name={TREE_VIEW_SEARCH_ID}
              onSearch={onSearch}
              placeholder={t('Search')}
            />
          )}
        </ToolbarItem>
        <ToolbarItem className="vms-tree-view-toolbar-buttons">
          <Tooltip content={treeViewOpen.value ? t('Close') : t('Open')}>
            <Button
              className="vms-tree-view-toolbar-buttons__padding"
              onClick={toggleDrawer}
              variant={ButtonVariant.plain}
            >
              {treeViewOpen.value ? <PanelCloseIcon /> : <PanelOpenIcon />}
            </Button>
          </Tooltip>
          {treeViewOpen.value && (
            <Button
              className="vms-tree-view-toolbar-buttons__padding"
              onClick={() => setShowAll((prev) => !prev)}
              variant={ButtonVariant.link}
            >
              {showAll ? t('Collapse all') : t('Expand all')}
            </Button>
          )}
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export default TreeViewToolbar;
