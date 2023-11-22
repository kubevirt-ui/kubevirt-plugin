import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNodeSelector } from '@kubevirt-utils/resources/vmi';
import { SearchIcon } from '@patternfly/react-icons';

type NodeSelectorProps = {
  vmi: V1VirtualMachineInstance;
};

const NodeSelector: React.FC<NodeSelectorProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const nodes = vmi?.spec?.nodeSelector;
  const nodeSelector = getNodeSelector(nodes);

  return nodeSelector ? (
    <>
      <SearchIcon className="co-m-requirement__icon co-icon-flex-child co-text-node" size="sm" />
      <span className="co-text-node">{nodeSelector}</span>
    </>
  ) : (
    <>{t('No selector')}</>
  );
};

export default NodeSelector;
