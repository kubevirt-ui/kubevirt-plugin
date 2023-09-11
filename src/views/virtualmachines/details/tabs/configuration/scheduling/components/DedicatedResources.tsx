import { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCPU } from '@kubevirt-utils/resources/vm';

type DedicatedResourcesProps = {
  vm: V1VirtualMachine;
};

const DedicatedResources: FC<DedicatedResourcesProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const isDedicatedResources = getCPU(vm)?.dedicatedCpuPlacement;

  return isDedicatedResources
    ? t('Workload scheduled with dedicated resources (guaranteed policy)')
    : t('No dedicated resources applied');
};

export default DedicatedResources;
