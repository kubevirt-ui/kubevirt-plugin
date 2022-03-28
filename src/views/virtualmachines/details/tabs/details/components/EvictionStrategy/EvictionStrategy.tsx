import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type EvictionStrategyProps = {
  vm: V1VirtualMachine;
};

const EvictionStrategy: React.FC<EvictionStrategyProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const evictionStrategy = vm?.spec?.template?.spec?.evictionStrategy;

  return <>{evictionStrategy || t('No eviction strategy')}</>;
};

export default EvictionStrategy;
