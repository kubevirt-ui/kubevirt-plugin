import xbytes from 'xbytes';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getMemorySize } from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
import { getCPU, getMemory, getVCPUCount } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { humanizeCpuCores } from '@kubevirt-utils/utils/humanize.js';
import { METRICS } from '@overview/OverviewTab/metric-charts-card/utils/constants';
import {
  findUnit,
  getHumanizedValue,
} from '@overview/OverviewTab/metric-charts-card/utils/hooks/utils';

export const getValueWithUnitText = (bytes: number, metric: string) => {
  const unit = findUnit(metric, bytes);
  const value = getHumanizedValue(metric, bytes, unit).toLocaleString();

  return `${value} ${unit}`;
};

export const getCpuRequestedText = (vmis: V1VirtualMachineInstance[]) => {
  const totalCPU = vmis.map((vmi) => getCPU(vmi)).reduce((acc, cpu) => acc + getVCPUCount(cpu), 0);

  return humanizeCpuCores(totalCPU).string;
};

export const getCpuUsageText = (cpuUsage: number) => {
  if (isNaN(cpuUsage)) {
    return NO_DATA_DASH;
  }
  return humanizeCpuCores(cpuUsage).string;
};

export const getMemoryCapacityText = (vmis: V1VirtualMachineInstance[]) => {
  const bytes = vmis
    .map((vmi) => {
      const memorySize = getMemorySize(getMemory(vmi));
      return xbytes.parseSize(`${memorySize?.size} ${memorySize?.unit}B`);
    })
    .reduce((acc, cur) => acc + cur, 0);

  return getValueWithUnitText(bytes, METRICS.MEMORY);
};
