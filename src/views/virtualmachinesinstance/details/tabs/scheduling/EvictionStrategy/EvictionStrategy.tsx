import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getEvictionStrategy } from '@kubevirt-utils/resources/vmi';

type EvictionStrategyProps = {
  vmi: V1VirtualMachineInstance;
};

const EvictionStrategy: React.FC<EvictionStrategyProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const evictionStrategy = getEvictionStrategy(vmi);

  return <>{evictionStrategy || t('No eviction strategy')}</>;
};

export default EvictionStrategy;
