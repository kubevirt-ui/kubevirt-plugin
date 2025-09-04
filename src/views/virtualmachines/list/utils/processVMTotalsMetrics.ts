import xbytes from 'xbytes';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getMemorySize } from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
import { getCPU, getMemory, getVCPUCount } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { humanizeCpuCores } from '@kubevirt-utils/utils/humanize.js';
import { PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';
import { METRICS } from '@overview/OverviewTab/metric-charts-card/utils/constants';
import {
  findUnit,
  getHumanizedValue,
} from '@overview/OverviewTab/metric-charts-card/utils/hooks/utils';

const getRawNumber = (response: PrometheusResponse) =>
  Number(response?.data?.result?.[0]?.value?.[1]);

const getValueWithUnitText = (bytes: number, metric: string) => {
  const unit = findUnit(metric, bytes);
  const value = getHumanizedValue(metric, bytes, unit).toLocaleString();

  return `${value} ${unit}`;
};

export const getCpuText = (response: PrometheusResponse) => {
  const value = getRawNumber(response);

  if (isNaN(value)) {
    return NO_DATA_DASH;
  }
  return humanizeCpuCores(value).string;
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

export const getMetricText = (response: PrometheusResponse, metric: string) => {
  const bytes = getRawNumber(response);
  return getValueWithUnitText(bytes, metric);
};

export const getCpuRequestedText = (vmis: V1VirtualMachineInstance[]) => {
  const totalCPU = vmis.map((vmi) => getCPU(vmi)).reduce((acc, cpu) => acc + getVCPUCount(cpu), 0);

  return humanizeCpuCores(totalCPU).string;
};
