import { type FC } from 'react';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCPU, getCPUMemoryDisplayValue, getMemory } from '@kubevirt-utils/resources/vm';
import { Skeleton } from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import './CPUMemory.scss';

type CPUMemoryProps = {
  fetchVMI?: boolean;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const CPUMemory: FC<CPUMemoryProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const isVMRunning = isRunning(vm);

  if ((isVMRunning && !vmi) || !vm) return <Skeleton className="pf-m-width-sm" />;

  const cpu = getCPU(vmi) ?? getCPU(vm);
  const memory = getMemory(vmi) ?? getMemory(vm);

  const { cpuMemoryText } = getCPUMemoryDisplayValue(cpu, memory, t);

  return (
    <span data-test="cpu-memory-value" id="virtual-machine-overview-details-cpu-memory">
      {cpuMemoryText}
    </span>
  );
};

export default CPUMemory;
