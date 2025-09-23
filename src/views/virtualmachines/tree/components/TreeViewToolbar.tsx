import React, { FC } from 'react';

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
} from '@patternfly/react-core';

import { HIDE, SHOW, SHOW_EMPTY_PROJECTS_KEY } from '../utils/constants';

const TreeViewToolbar: FC = () => {
  const { t } = useKubevirtTranslation();
  const [showEmptyProjects, setShowEmptyProjects] = useLocalStorage(SHOW_EMPTY_PROJECTS_KEY, HIDE);

  return (
    <Toolbar className="vms-tree-view-toolbar" isSticky>
      <ToolbarContent className="vms-tree-view-toolbar-content">
        <Stack className="vms-tree-view__toolbar-section">
          <StackItem className="pf-v6-u-my-md">
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
          <Divider />
        </Stack>
      </ToolbarContent>
    </Toolbar>
  );
};

export default TreeViewToolbar;
