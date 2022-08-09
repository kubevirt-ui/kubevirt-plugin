import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type DedicatedResourcesProps = {
  vm: V1VirtualMachine;
};

const DedicatedResources: React.FC<DedicatedResourcesProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const isDedicatedResources = vm?.spec?.template?.spec?.domain?.cpu?.dedicatedCpuPlacement;

  return isDedicatedResources
    ? t('Workload scheduled with dedicated resources (guaranteed policy)')
    : t('No dedicated resources applied');
};

export default DedicatedResources;
