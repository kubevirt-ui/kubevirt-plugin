import React, { ChangeEvent, FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import {
  Content,
  Divider,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Switch,
  Toolbar,
  ToolbarContent,
  TreeViewSearch,
} from '@patternfly/react-core';

import { HIDE, SHOW, SHOW_EMPTY_PROJECTS_KEY, TREE_VIEW_SEARCH_ID } from '../utils/constants';

type TreeViewToolbarProps = {
  hideSwitch: boolean;
  onSearch: (event: ChangeEvent<HTMLInputElement>) => void;
};

const TreeViewToolbar: FC<TreeViewToolbarProps> = ({ hideSwitch, onSearch }) => {
  const { t } = useKubevirtTranslation();
  const [showEmptyProjects, setShowEmptyProjects] = useLocalStorage(SHOW_EMPTY_PROJECTS_KEY, HIDE);

  return (
    <Toolbar className="vms-tree-view-toolbar" isSticky>
      <ToolbarContent className="vms-tree-view-toolbar-content">
        <Stack className="vms-tree-view__toolbar-section" hasGutter>
          <StackItem>
            <TreeViewSearch
              className="vms-tree-view__search-input"
              id={TREE_VIEW_SEARCH_ID}
              name={TREE_VIEW_SEARCH_ID}
              onSearch={onSearch}
              placeholder={t('Search')}
            />
          </StackItem>
          {!hideSwitch && (
            <>
              <Divider />
              <StackItem>
                <Split>
                  <SplitItem className="pf-v6-u-ml-md">
                    <Content component="p">{t('Show only projects with VirtualMachines')}</Content>
                  </SplitItem>
                  <SplitItem isFilled />
                  <Switch
                    checked={showEmptyProjects === HIDE}
                    className="vms-tree-view__toolbar-switch"
                    isReversed
                    onChange={(_, checked) => setShowEmptyProjects(checked ? HIDE : SHOW)}
                  />
                </Split>
              </StackItem>
            </>
          )}
          <Divider />
        </Stack>
      </ToolbarContent>
    </Toolbar>
  );
};

export default TreeViewToolbar;
