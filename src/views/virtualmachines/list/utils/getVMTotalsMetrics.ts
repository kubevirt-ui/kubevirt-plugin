import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { METRICS } from '@overview/OverviewTab/metric-charts-card/utils/constants';

import { getVMMetrics, Metric } from '../metrics';

import {
  getCpuRequestedText,
  getCpuUsageText,
  getMemoryCapacityText,
  getValueWithUnitText,
} from './processVMTotalsMetrics';

type GetVMTotalsMetricsProps = {
  vmis: V1VirtualMachineInstance[];
  vms: V1VirtualMachine[];
};

const getVMTotalsMetrics = ({
  vmis,
  vms,
}: GetVMTotalsMetricsProps): Partial<Record<Metric, string>> => {
  const totalCpuUsage = vms.reduce((acc, vm) => acc + (getVMMetrics(vm)?.cpuUsage ?? 0), 0);
  const totalMemoryUsage = vms.reduce((acc, vm) => acc + (getVMMetrics(vm)?.memoryUsage ?? 0), 0);
  const totalStorageUsage = vms.reduce((acc, vm) => acc + (getVMMetrics(vm)?.storageUsage ?? 0), 0);
  const totalStorageCapacity = vms.reduce(
    (acc, vm) => acc + (getVMMetrics(vm)?.storageCapacity ?? 0),
    0,
  );

  return {
    [Metric.CpuRequested]: getCpuRequestedText(vmis),
    [Metric.CpuUsage]: getCpuUsageText(totalCpuUsage),
    [Metric.MemoryCapacity]: getMemoryCapacityText(vmis),
    [Metric.MemoryUsage]: getValueWithUnitText(totalMemoryUsage, METRICS.MEMORY),
    [Metric.StorageCapacity]: getValueWithUnitText(totalStorageCapacity, METRICS.STORAGE),
    [Metric.StorageUsage]: getValueWithUnitText(totalStorageUsage, METRICS.STORAGE),
  };
};

export default getVMTotalsMetrics;
