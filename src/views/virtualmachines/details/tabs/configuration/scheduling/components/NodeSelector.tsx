import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNodeSelector } from '@kubevirt-utils/resources/vmi';

type NodeSelectorProps = {
  vm: V1VirtualMachine;
};

const NodeSelector: FC<NodeSelectorProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const nodes = vm?.spec?.template?.spec?.nodeSelector;
  const nodeSelector = getNodeSelector(nodes);

  return nodeSelector ? (
    <>
      <span className="co-text-node">{nodeSelector}</span>
    </>
  ) : (
    <>{t('No selector')}</>
  );
};

export default NodeSelector;
