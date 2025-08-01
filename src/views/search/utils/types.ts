import { CAPACITY_UNITS } from '@kubevirt-utils/components/CapacityInput/utils';
import { NumberOperator } from '@kubevirt-utils/utils/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { HWDeviceKind, SchedulingKind } from './constants';

export type AdvancedSearchInputs = AdvancedSearchQueryInputs & {
  labelInputText?: string;
};

export type AdvancedSearchQueryInputs = Partial<{
  [VirtualMachineRowFilterType.Architecture]: string[];
  [VirtualMachineRowFilterType.Cluster]: string[];
  [VirtualMachineRowFilterType.CPU]: CPUValue;
  [VirtualMachineRowFilterType.DateCreatedFrom]: string;
  [VirtualMachineRowFilterType.DateCreatedTo]: string;
  [VirtualMachineRowFilterType.Description]: string;
  [VirtualMachineRowFilterType.HWDevices]: HWDevicesValue;
  [VirtualMachineRowFilterType.IP]: string;
  [VirtualMachineRowFilterType.Labels]: string[];
  [VirtualMachineRowFilterType.Memory]: MemoryValue;
  [VirtualMachineRowFilterType.NAD]: string[];
  [VirtualMachineRowFilterType.Name]: string;
  [VirtualMachineRowFilterType.Node]: string[];
  [VirtualMachineRowFilterType.OS]: string[];
  [VirtualMachineRowFilterType.Project]: string[];
  [VirtualMachineRowFilterType.Scheduling]: SchedulingValue;
  [VirtualMachineRowFilterType.Status]: string[];
  [VirtualMachineRowFilterType.StorageClass]: string[];
}>;

export type SearchSuggestResult = {
  resources: { cluster?: string; name: string; namespace?: string }[];
  resourcesMatching: Record<
    | VirtualMachineRowFilterType.Description
    | VirtualMachineRowFilterType.IP
    | VirtualMachineRowFilterType.Labels,
    number
  >;
};

export type SchedulingValue = {
  [SchedulingKind.AFFINITY_RULES]: boolean;
  [SchedulingKind.NODE_SELECTOR]: boolean;
};

export type HWDevicesValue = {
  [HWDeviceKind.GPU]: boolean;
  [HWDeviceKind.HOST]: boolean;
};

export type CPUValue = {
  operator: NumberOperator;
  value: number;
};

export type MemoryValue = {
  operator: NumberOperator;
  unit: CAPACITY_UNITS;
  value: number;
};
