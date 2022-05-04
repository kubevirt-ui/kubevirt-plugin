import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNodeSelector } from '@kubevirt-utils/resources/vmi';
import { SearchIcon } from '@patternfly/react-icons';

type NodeSelectorProps = {
  vm: V1VirtualMachine;
};

const NodeSelector: React.FC<NodeSelectorProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const nodes = vm?.spec?.template?.spec?.nodeSelector;
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
