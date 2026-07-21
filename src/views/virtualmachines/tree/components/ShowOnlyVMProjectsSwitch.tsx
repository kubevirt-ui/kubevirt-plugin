import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { Content, Split, SplitItem, Switch, Tooltip } from '@patternfly/react-core';

import { HIDE, SHOW, SHOW_EMPTY_PROJECTS_KEY } from '../utils/constants';
import { isShowOnlyVMProjectsChecked } from '../utils/utils';

type ShowOnlyVMProjectsSwitchProps = {
  hasVMs: boolean;
};

const ShowOnlyVMProjectsSwitch: FC<ShowOnlyVMProjectsSwitchProps> = ({ hasVMs }) => {
  const { t } = useKubevirtTranslation();
  const [showEmptyProjects, setShowEmptyProjects] = useLocalStorage(SHOW_EMPTY_PROJECTS_KEY, HIDE);
  const showOnlyVMProjectsLabel = t('Show only projects with VirtualMachines');

  const switchControl = (
    <Switch
      aria-label={showOnlyVMProjectsLabel}
      checked={isShowOnlyVMProjectsChecked(hasVMs, showEmptyProjects)}
      className="vms-tree-view__toolbar-switch"
      isDisabled={!hasVMs}
      isReversed
      onChange={(_, checked) => setShowEmptyProjects(checked ? HIDE : SHOW)}
    />
  );

  return (
    <Split>
      <SplitItem className="pf-v6-u-ml-md">
        <Content component="p">{showOnlyVMProjectsLabel}</Content>
      </SplitItem>
      <SplitItem isFilled />
      {!hasVMs ? (
        <Tooltip content={t('Create a VirtualMachine to enable this filter.')}>
          <span tabIndex={0}>{switchControl}</span>
        </Tooltip>
      ) : (
        switchControl
      )}
    </Split>
  );
};

export default ShowOnlyVMProjectsSwitch;
