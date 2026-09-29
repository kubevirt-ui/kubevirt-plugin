import xbytes from 'xbytes';

import { type V1CPU, type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getInstanceTypeCPU,
  getInstanceTypeMemory,
} from '@kubevirt-utils/resources/instancetype/selectors';
import { vCPUCount } from '@kubevirt-utils/resources/template';
import { getCPU, getMemory } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { isRunning } from '@virtualmachines/utils';
import { getInstanceTypeFromMapper, type InstanceTypeMapper } from '@virtualmachines/utils/mappers';

import {
  getCPUUsagePercentage,
  getMemoryUsagePercentage,
  getNetworkUsagePercentage,
} from './metrics';
import { type VMCallbacks } from './vmColumnTypes';

const shouldShowUsage = (value: number | undefined, vm: V1VirtualMachine): value is number =>
  value !== undefined && Number.isFinite(value) && isRunning(vm);

const formatUsagePercentage = (value: number | undefined, vm: V1VirtualMachine): string => {
  if (!shouldShowUsage(value, vm)) {
    return NO_DATA_DASH;
  }

  return `${value.toFixed(2)}%`;
};

export const getCPUUsageDisplayValue = (vm: V1VirtualMachine, vmiCPU: undefined | V1CPU): string =>
  formatUsagePercentage(getCPUUsagePercentage(vm, vmiCPU), vm);

export const getMemoryUsageDisplayValue = (
  vm: V1VirtualMachine,
  vmiMemory: string | undefined,
): string => formatUsagePercentage(getMemoryUsagePercentage(vm, vmiMemory), vm);

export const getNetworkUsageDisplayValue = (vm: V1VirtualMachine): string => {
  const totalTransferred = getNetworkUsagePercentage(vm);

  if (!shouldShowUsage(totalTransferred, vm)) {
    return NO_DATA_DASH;
  }

  const formattedUsage = xbytes(totalTransferred, {
    fixed: 0,
    iec: true,
  });

  return `${formattedUsage}ps`;
};
export const getVMVCPUDisplayValue = (
  vm: V1VirtualMachine,
  getVmi: VMCallbacks['getVmi'],
  instanceTypeMapper: InstanceTypeMapper,
): string => {
  const vmi = getVmi(vm);
  const cpuSpec = getCPU(vm) ?? getCPU(vmi);
  if (cpuSpec) return String(vCPUCount(cpuSpec));
  const itCpu = getInstanceTypeCPU(getInstanceTypeFromMapper(instanceTypeMapper, vm));
  return itCpu != null ? String(itCpu) : NO_DATA_DASH;
};
export const getVMMemoryDisplayValue = (
  vm: V1VirtualMachine,
  getVmi: VMCallbacks['getVmi'],
  instanceTypeMapper: InstanceTypeMapper,
): string => {
  const vmi = getVmi(vm);
  const memory =
    getMemory(vm) ??
    getMemory(vmi) ??
    getInstanceTypeMemory(getInstanceTypeFromMapper(instanceTypeMapper, vm))?.toString();
  return memory ? readableSizeUnit(memory) : NO_DATA_DASH;
};
