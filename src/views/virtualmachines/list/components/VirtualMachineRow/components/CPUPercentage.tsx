import React, { FC } from 'react';

import { V1CPU } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getVCPUCount } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getVMMetrics } from '@virtualmachines/list/metrics';

type CPUPercentageProps = {
  vmiCPU: V1CPU;
  vmName: string;
  vmNamespace: string;
};

const CPUPercentage: FC<CPUPercentageProps> = ({ vmiCPU, vmName, vmNamespace }) => {
  const { cpuUsage } = getVMMetrics(vmName, vmNamespace);

  if (isEmpty(cpuUsage)) return <span>{NO_DATA_DASH}</span>;

  const cpuRequested = getVCPUCount(vmiCPU);
  const percentage = (cpuUsage * 100) / cpuRequested;
  return <span>{percentage.toFixed(2)}%</span>;
};

export default CPUPercentage;
