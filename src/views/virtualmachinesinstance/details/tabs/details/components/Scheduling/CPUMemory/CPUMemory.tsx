import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCPUCount } from '@kubevirt-utils/resources/vmi';

type TolerationsProps = {
  vmi: V1VirtualMachineInstance;
};

const CPUMemory: React.FC<TolerationsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  const cpu = getCPUCount(vmi?.spec?.domain?.cpu);

  const memory = (vmi?.spec?.domain?.resources?.requests as { [key: string]: string })?.memory;

  return <>{t('{{cpu}} CPU | {{memory}} Memory', { cpu, memory })}</>;
};

export default CPUMemory;
