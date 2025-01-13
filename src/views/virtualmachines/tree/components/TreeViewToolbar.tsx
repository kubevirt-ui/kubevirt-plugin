import React, { ChangeEvent, FC, ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import {
  Divider,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Switch,
  Text,
  Toolbar,
  ToolbarContent,
  TreeViewSearch,
} from '@patternfly/react-core';

import { HIDE, SHOW, SHOW_EMPTY_PROJECTS_KEY, TREE_VIEW_SEARCH_ID } from '../utils/constants';

type TreeViewToolbarProps = {
  closeComponent: ReactNode;
  isSwitchDisabled: boolean;
  onSearch: (event: ChangeEvent<HTMLInputElement>) => void;
};

const TreeViewToolbar: FC<TreeViewToolbarProps> = ({
  closeComponent,
  isSwitchDisabled,
  onSearch,
}) => {
  const { t } = useKubevirtTranslation();
  const [showEmptyProjects, setShowEmptyProjects] = useLocalStorage(SHOW_EMPTY_PROJECTS_KEY, HIDE);

  return (
    <Toolbar className="vms-tree-view-toolbar" isSticky>
      <ToolbarContent className="vms-tree-view-toolbar-content">
        <Stack className="vms-tree-view__toolbar-section" hasGutter>
          <StackItem>
            <Split>
              <SplitItem className="vms-tree-view__search-input" isFilled>
                <TreeViewSearch
                  id={TREE_VIEW_SEARCH_ID}
                  name={TREE_VIEW_SEARCH_ID}
                  onSearch={onSearch}
                  placeholder={t('Search')}
                />
              </SplitItem>
              <SplitItem className="vms-tree-view__close-container">{closeComponent}</SplitItem>
            </Split>
          </StackItem>
          <Divider />
          <StackItem>
            <Split>
              <SplitItem className="pf-v5-u-ml-md">
                <Text>{t('Show only projects with VirtualMachines')}</Text>
              </SplitItem>
              <SplitItem isFilled />
              <Switch
                checked={!isSwitchDisabled && showEmptyProjects === HIDE}
                className="vms-tree-view__toolbar-switch"
                isDisabled={isSwitchDisabled}
                isReversed
                onChange={(_, checked) => setShowEmptyProjects(checked ? HIDE : SHOW)}
              />
            </Split>
          </StackItem>
          <Divider />
        </Stack>
      </ToolbarContent>
    </Toolbar>
  );
};

export default TreeViewToolbar;
