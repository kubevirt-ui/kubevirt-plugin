import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { vCPUCount } from '@kubevirt-utils/resources/template/utils';

type TolerationsProps = {
  vmi: V1VirtualMachineInstance;
};

const CPUMemory: React.FC<TolerationsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  const cpu = vCPUCount(vmi?.spec?.domain?.cpu);

  const memory = (vmi?.spec?.domain?.resources?.requests as { [key: string]: string })?.memory;

  return <>{t('{{cpu}} CPU | {{memory}} Memory', { cpu, memory })}</>;
};

export default CPUMemory;
