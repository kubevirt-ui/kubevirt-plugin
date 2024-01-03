import { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCPU } from '@kubevirt-utils/resources/vm';

type DedicatedResourcesProps = {
  vmi: V1VirtualMachineInstance;
};

const DedicatedResources: FC<DedicatedResourcesProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const isDedicatedResources = getCPU(vmi)?.dedicatedCpuPlacement;

  return isDedicatedResources
    ? t('Workload scheduled with dedicated resources (guaranteed policy)')
    : t('No dedicated resources applied');
};

export default DedicatedResources;
