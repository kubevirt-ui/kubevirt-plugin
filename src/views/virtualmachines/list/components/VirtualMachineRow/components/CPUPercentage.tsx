import React, { FC } from 'react';

import { V1CPU, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCPUUsagePercentage } from '@virtualmachines/list/metrics';
import { isRunning } from '@virtualmachines/utils';

type CPUPercentageProps = {
  vm: V1VirtualMachine;
  vmiCPU: V1CPU;
};

const CPUPercentage: FC<CPUPercentageProps> = ({ vm, vmiCPU }) => {
  const cpuUsagePercentage = getCPUUsagePercentage(vm, vmiCPU);

  if (isEmpty(cpuUsagePercentage) || !isRunning(vm)) return <span>{NO_DATA_DASH}</span>;

  return <span>{cpuUsagePercentage.toFixed(2)}%</span>;
};

export default CPUPercentage;
