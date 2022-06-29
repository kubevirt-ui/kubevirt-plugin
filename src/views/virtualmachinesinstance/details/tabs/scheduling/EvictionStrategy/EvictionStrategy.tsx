import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type EvictionStrategyProps = {
  vmi: V1VirtualMachineInstance;
};

const EvictionStrategy: React.FC<EvictionStrategyProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const evictionStrategy = vmi?.spec?.evictionStrategy;

  return <>{evictionStrategy || t('No eviction strategy')}</>;
};

export default EvictionStrategy;
