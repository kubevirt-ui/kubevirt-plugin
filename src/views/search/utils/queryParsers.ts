import { CAPACITY_UNITS } from '@kubevirt-utils/components/CapacityInput/utils';
import { type KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { NumberOperator } from '@kubevirt-utils/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  initialGuestAgent,
  initialHWDevices,
  initialScheduling,
} from '@search/components/AdvancedSearchModal/constants/initialValues';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { arrayFields, singleStringFields, validSearchQueryParams } from './constants';
import { type AdvancedSearchQueryInputs, type CPUValue, type MemoryValue } from './types';

type AdvancedSearchQueryInputValue = AdvancedSearchQueryInputs[keyof AdvancedSearchQueryInputs];

export const parseCPUValue = (values: string[]): CPUValue | undefined => {
  const parts = values[0]?.split(' ');
  if (parts?.length !== 2) return undefined;

  const operator = Object.values(NumberOperator).find((opt) => opt === parts[0]);
  const value = Number(parts[1]);

  if (!operator || isNaN(value)) return undefined;
  return { operator, value };
};

export const parseMemoryValue = (values: string[]): MemoryValue | undefined => {
  const parts = values[0]?.split(' ');
  if (parts?.length !== 3) return undefined;

  const operator = Object.values(NumberOperator).find((opt) => opt === parts[0]);
  const value = Number(parts[1]);
  const unit = Object.values(CAPACITY_UNITS).find((cap) => cap === parts[2]);

  if (!operator || isNaN(value) || !unit) return undefined;
  return { operator, unit, value };
};

export const parseBooleanMap = <T extends Record<string, boolean>>(
  values: string[],
  initial: T,
): T => {
  const result = { ...initial };
  for (const key of values) {
    if (key in result) {
      (result as Record<string, boolean>)[key] = true;
    }
  }
  return result;
};

const booleanMapDefaults: Record<string, Record<string, boolean>> = {
  [VirtualMachineRowFilterType.GuestAgent]: initialGuestAgent,
  [VirtualMachineRowFilterType.HWDevices]: initialHWDevices,
  [VirtualMachineRowFilterType.Scheduling]: initialScheduling,
};

export const parseSingleFilterValue = (
  key: string,
  values: string[],
): AdvancedSearchQueryInputValue | undefined => {
  if (singleStringFields.has(key as VirtualMachineRowFilterType)) return values[0] ?? '';
  if (arrayFields.has(key as VirtualMachineRowFilterType)) return values;
  if (key === VirtualMachineRowFilterType.CPU) return parseCPUValue(values);
  if (key === VirtualMachineRowFilterType.Memory) return parseMemoryValue(values);
  if (key in booleanMapDefaults)
    return parseBooleanMap(values, booleanMapDefaults[key]) as AdvancedSearchQueryInputValue;
};

export const convertFilterStateToModalInputs = (
  filters: Partial<KubevirtFilterState>,
): AdvancedSearchQueryInputs => {
  const result: AdvancedSearchQueryInputs = {};

  for (const [key, values] of Object.entries(filters)) {
    if (!validSearchQueryParams.includes(key) || isEmpty(values)) continue;
    const parsed = parseSingleFilterValue(key, values);
    if (parsed !== undefined) result[key] = parsed;
  }

  return result;
};
