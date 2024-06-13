import React, { FC } from 'react';

import { V1VirtualMachineInstanceSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { getNodeSelectorLabel } from './utils';

type NodeSelectorProps = {
  nodeSelector: V1VirtualMachineInstanceSpec['nodeSelector'];
};

const NodeSelectorDetailItem: FC<NodeSelectorProps> = ({ nodeSelector }) => {
  const { t } = useKubevirtTranslation();
  const nodeSelectorLabel = getNodeSelectorLabel(nodeSelector);

  return !isEmpty(nodeSelector) ? (
    <span className="co-text-node">{nodeSelectorLabel}</span>
  ) : (
    <>{t('No selector')}</>
  );
};

export default NodeSelectorDetailItem;
