import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { METRICS } from '@overview/OverviewTab/metric-charts-card/utils/constants';

import { getVMMetrics, Metric } from '../metrics';
import {
  getCpuRequestedText,
  getCpuUsageText,
  getMemoryCapacityText,
  getValueWithUnitText,
} from '../utils/processVMTotalsMetrics';

type UseVMTotalsMetricsProps = {
  vmis: V1VirtualMachineInstance[];
  vms: V1VirtualMachine[];
};

const useVMTotalsMetrics = ({ vmis, vms }: UseVMTotalsMetricsProps) => {
  const totalCpuUsage = vms.reduce((acc, vm) => acc + (getVMMetrics(vm)?.cpuUsage ?? 0), 0);
  const totalMemoryUsage = vms.reduce((acc, vm) => acc + (getVMMetrics(vm)?.memoryUsage ?? 0), 0);
  const totalStorageUsage = vms.reduce((acc, vm) => acc + (getVMMetrics(vm)?.storageUsage ?? 0), 0);
  const totalStorageCapacity = vms.reduce(
    (acc, vm) => acc + (getVMMetrics(vm)?.storageCapacity ?? 0),
    0,
  );

  return {
    [Metric.cpuRequested]: getCpuRequestedText(vmis),
    [Metric.cpuUsage]: getCpuUsageText(totalCpuUsage),
    [Metric.memoryCapacity]: getMemoryCapacityText(vmis),
    [Metric.memoryUsage]: getValueWithUnitText(totalMemoryUsage, METRICS.MEMORY),
    [Metric.storageCapacity]: getValueWithUnitText(totalStorageCapacity, METRICS.STORAGE),
    [Metric.storageUsage]: getValueWithUnitText(totalStorageUsage, METRICS.STORAGE),
  };
};

export default useVMTotalsMetrics;
