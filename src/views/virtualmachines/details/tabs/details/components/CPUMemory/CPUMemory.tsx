import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { vCPUCount } from '@kubevirt-utils/resources/template/utils';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';

type CPUMemoryProps = {
  vm: V1VirtualMachine;
};

const CPUMemory: React.FC<CPUMemoryProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  const cpu = vCPUCount(vm?.spec?.template?.spec?.domain?.cpu);

  const memory = readableSizeUnit(
    (vm?.spec?.template?.spec?.domain?.resources?.requests as { [key: string]: string })?.memory,
  );

  return (
    <span data-test-id="virtual-machine-overview-details-cpu-memory">
      {t('{{cpu}} CPU | {{memory}} Memory', { cpu, memory })}
    </span>
  );
};

export default CPUMemory;
