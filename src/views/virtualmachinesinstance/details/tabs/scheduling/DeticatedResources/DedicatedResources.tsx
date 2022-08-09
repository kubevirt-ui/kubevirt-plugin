import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type DedicatedResourcesProps = {
  vmi: V1VirtualMachineInstance;
};

const DedicatedResources: React.FC<DedicatedResourcesProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const isDedicatedResources = vmi?.spec?.domain?.cpu?.dedicatedCpuPlacement;

  return isDedicatedResources
    ? t('Workload scheduled with dedicated resources (guaranteed policy)')
    : t('No dedicated resources applied');
};

export default DedicatedResources;
