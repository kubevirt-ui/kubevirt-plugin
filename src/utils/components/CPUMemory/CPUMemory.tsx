import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { vCPUCount } from '@kubevirt-utils/resources/template/utils';
import { getCPU, getMemory } from '@kubevirt-utils/resources/vm';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { Skeleton } from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

type CPUMemoryProps = {
  fetchVMI?: boolean;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const CPUMemory: FC<CPUMemoryProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const isVMRunning = isRunning(vm);

  if ((isVMRunning && !vmi) || !vm) return <Skeleton className="pf-m-width-sm" />;

  const cpu = vCPUCount(getCPU(vm) || getCPU(vmi));

  const memory = readableSizeUnit(getMemory(vm) || getMemory(vmi));

  return (
    <span data-test-id="virtual-machine-overview-details-cpu-memory">
      {t('{{cpu}} CPU | {{memory}} Memory', { cpu, memory })}
    </span>
  );
};

export default CPUMemory;
