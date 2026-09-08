import React, { FC } from 'react';

import { type V1CPU, type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getCPUUsageDisplayValue } from '@virtualmachines/list/usageDisplayValues';

type CPUPercentageProps = {
  vm: V1VirtualMachine;
  vmiCPU: undefined | V1CPU;
};

const CPUPercentage: FC<CPUPercentageProps> = ({ vm, vmiCPU }) => (
  <span>{getCPUUsageDisplayValue(vm, vmiCPU)}</span>
);

export default CPUPercentage;
