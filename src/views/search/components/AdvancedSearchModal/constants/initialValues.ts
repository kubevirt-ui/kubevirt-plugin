import { CAPACITY_UNITS } from '@kubevirt-utils/components/CapacityInput/utils';
import { NumberOperator } from '@kubevirt-utils/utils/constants';
import { CPUValue, HWDevicesValue, MemoryValue, SchedulingValue } from '@search/utils/types';

export const initialVCPU: CPUValue = {
  operator: NumberOperator.GreaterThan,
  value: NaN,
};

export const initialMemory: MemoryValue = {
  operator: NumberOperator.GreaterThan,
  unit: CAPACITY_UNITS.GiB,
  value: NaN,
};

export const initialHWDevices: HWDevicesValue = {
  gpu: false,
  host: false,
};

export const initialScheduling: SchedulingValue = {
  affinityRules: false,
  nodeSelector: false,
};
