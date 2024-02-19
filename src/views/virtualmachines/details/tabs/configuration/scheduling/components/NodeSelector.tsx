import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNodeSelector } from '@kubevirt-utils/resources/vmi';
import { Icon } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

type NodeSelectorProps = {
  vm: V1VirtualMachine;
};

const NodeSelector: FC<NodeSelectorProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const nodes = vm?.spec?.template?.spec?.nodeSelector;
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
