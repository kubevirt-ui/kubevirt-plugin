import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNodeSelector } from '@kubevirt-utils/resources/vmi';
import { Icon } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

type NodeSelectorProps = {
  vmi: V1VirtualMachineInstance;
};

const NodeSelector: FC<NodeSelectorProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const nodes = vmi?.spec?.nodeSelector;
  const nodeSelector = getNodeSelector(nodes);

  return nodeSelector ? (
    <>
      <Icon className="co-m-requirement__icon co-icon-flex-child co-text-node" size="sm">
        <SearchIcon />
      </Icon>
      <span className="co-text-node">{nodeSelector}</span>
    </>
  ) : (
    <>{t('No selector')}</>
  );
};

export default NodeSelector;
