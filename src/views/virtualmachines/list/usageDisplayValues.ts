import xbytes from 'xbytes';

import { type V1CPU, type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isRunning } from '@virtualmachines/utils';

import {
  getCPUUsagePercentage,
  getMemoryUsagePercentage,
  getNetworkUsagePercentage,
} from './metrics';

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

  // eslint-disable-next-line i18next/no-literal-string
  return `${formattedUsage}ps`;
};
