import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCPUCount } from '@kubevirt-utils/resources/vmi';

type CPUMemoryProps = {
  vm: V1VirtualMachine;
};

const CPUMemory: React.FC<CPUMemoryProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  const cpu = getCPUCount(vm?.spec?.template?.spec?.domain?.cpu);

  const memory = (
    vm?.spec?.template?.spec?.domain?.resources?.requests as { [key: string]: string }
  )?.memory;

  return <>{t('{{cpu}} CPU | {{memory}} Memory', { cpu, memory })}</>;
};

export default CPUMemory;
