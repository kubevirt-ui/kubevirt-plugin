import React, { ChangeEvent, FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Divider,
  Stack,
  StackItem,
  Switch,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  TreeViewSearch,
} from '@patternfly/react-core';

import { HIDE, SHOW, TREE_VIEW_SEARCH_ID } from '../utils/constants';
import { treeViewOpen } from '../utils/utils';

type TreeViewToolbarProps = {
  onSearch: (event: ChangeEvent<HTMLInputElement>) => void;
  setShowDefaultProjects: (show: string) => void;
  showDefaultProjects: string;
};

const TreeViewToolbar: FC<TreeViewToolbarProps> = ({
  onSearch,
  setShowDefaultProjects,
  showDefaultProjects,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Toolbar className="vms-tree-view-toolbar" isSticky>
      <ToolbarContent className="vms-tree-view-toolbar-content">
        <Stack className="vms-tree-view-toolbar-section" hasGutter>
          <StackItem>
            <ToolbarItem>
              {treeViewOpen.value && (
                <TreeViewSearch
                  className="vms-tree-view-search-input"
                  id={TREE_VIEW_SEARCH_ID}
                  name={TREE_VIEW_SEARCH_ID}
                  onSearch={onSearch}
                  placeholder={t('Search')}
                />
              )}
            </ToolbarItem>
          </StackItem>
          <Divider />
          <StackItem>
            {treeViewOpen.value && (
              <Switch
                checked={showDefaultProjects === SHOW}
                className="vms-tree-view-toolbar-default-project-switch"
                label={t('Show OCP default projects')}
                onChange={(_, checked) => setShowDefaultProjects(checked ? SHOW : HIDE)}
              />
            )}
          </StackItem>
          <Divider />
        </Stack>
      </ToolbarContent>
    </Toolbar>
  );
};

export default TreeViewToolbar;
