import React, { ChangeEvent, FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  Divider,
  Stack,
  StackItem,
  Toolbar,
  ToolbarContent,
  TreeViewSearch,
} from '@patternfly/react-core';

import { TREE_VIEW_SEARCH_ID } from '../utils/constants';

import ShowOnlyVMProjectsSwitch from './ShowOnlyVMProjectsSwitch';

type TreeViewToolbarProps = {
  hasVMs: boolean;
  onSearch: (event: ChangeEvent<HTMLInputElement>) => void;
};

const TreeViewToolbar: FC<TreeViewToolbarProps> = ({ hasVMs, onSearch }) => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();

  return (
    <Toolbar className="vms-tree-view-toolbar" isSticky>
      <ToolbarContent className="vms-tree-view-toolbar-content">
        <Stack className="vms-tree-view__toolbar-section">
          <StackItem>
            <TreeViewSearch
              className="vms-tree-view__search-input"
              id={TREE_VIEW_SEARCH_ID}
              name={TREE_VIEW_SEARCH_ID}
              onSearch={onSearch}
              placeholder={isACMPage ? t('Search clusters and projects') : t('Search projects')}
            />
          </StackItem>
          <StackItem className="pf-v6-u-mb-md">
            <ShowOnlyVMProjectsSwitch hasVMs={hasVMs} />
          </StackItem>
          <Divider />
        </Stack>
      </ToolbarContent>
    </Toolbar>
  );
};

export default TreeViewToolbar;
