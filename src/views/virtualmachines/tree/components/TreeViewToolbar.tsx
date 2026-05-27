import React, { ChangeEvent, FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import useIsACMPage from '@multicluster/useIsACMPage';
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

import { HIDE, SHOW, SHOW_EMPTY_NAMESPACES_KEY, TREE_VIEW_SEARCH_ID } from '../utils/constants';

type TreeViewToolbarProps = {
  onSearch: (event: ChangeEvent<HTMLInputElement>) => void;
};

const TreeViewToolbar: FC<TreeViewToolbarProps> = ({ onSearch }) => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const [showEmptyNamespaces, setShowEmptyNamespaces] = useLocalStorage(SHOW_EMPTY_NAMESPACES_KEY, HIDE);

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
              placeholder={isACMPage ? t('Search clusters and namespaces') : t('Search namespaces')}
            />
          </StackItem>
          <StackItem className="pf-v6-u-mb-md">
            <Split>
              <SplitItem className="pf-v6-u-ml-md">
                <Content component="p">{t('Show only namespaces with VirtualMachines')}</Content>
              </SplitItem>
              <SplitItem isFilled />
              <Switch
                aria-label={t('Show only namespaces with VirtualMachines')}
                checked={showEmptyNamespaces === HIDE}
                className="vms-tree-view__toolbar-switch"
                isReversed
                onChange={(_, checked) => setShowEmptyNamespaces(checked ? HIDE : SHOW)}
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
