import { CAPACITY_UNITS } from '@kubevirt-utils/components/CapacityInput/utils';
import { KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { NumberOperator, ROW_FILTERS_PREFIX } from '@kubevirt-utils/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { skipRowFilterPrefix, validSearchQueryParams } from './constants';
import { AdvancedSearchQueryInputs } from './types';

type AdvancedSearchQueryInputValue = AdvancedSearchQueryInputs[keyof AdvancedSearchQueryInputs];

const transformObjectToQueryValues = (object: Record<string, boolean>): string[] =>
  Object.keys(object).filter((key) => object[key]);

export const createCPUQueryValue = (operator: NumberOperator, value: number): string =>
  `${operator} ${value}`;

export const createMemoryQueryValue = (
  operator: NumberOperator,
  value: number,
  unit: CAPACITY_UNITS,
): string => `${operator} ${value} ${unit}`;

const customQueryValuesMap: Record<string, (value: AdvancedSearchQueryInputValue) => string[]> = {
  [VirtualMachineRowFilterType.CPU]: (
    vCPU: AdvancedSearchQueryInputs[VirtualMachineRowFilterType.CPU],
  ) => (!isNaN(vCPU?.value) ? [createCPUQueryValue(vCPU.operator, vCPU.value)] : []),
  [VirtualMachineRowFilterType.GuestAgent]: (
    guestAgent: AdvancedSearchQueryInputs[VirtualMachineRowFilterType.GuestAgent],
  ) => transformObjectToQueryValues(guestAgent),
  [VirtualMachineRowFilterType.HWDevices]: (
    hwDevices: AdvancedSearchQueryInputs[VirtualMachineRowFilterType.HWDevices],
  ) => transformObjectToQueryValues(hwDevices),
  [VirtualMachineRowFilterType.Memory]: (
    memory: AdvancedSearchQueryInputs[VirtualMachineRowFilterType.Memory],
  ) =>
    !isNaN(memory?.value)
      ? [createMemoryQueryValue(memory.operator, memory.value, memory.unit)]
      : [],
  [VirtualMachineRowFilterType.Scheduling]: (
    scheduling: AdvancedSearchQueryInputs[VirtualMachineRowFilterType.Scheduling],
  ) => transformObjectToQueryValues(scheduling),
};

const createQueryValues = (value: AdvancedSearchQueryInputValue, fieldKey: string): string[] => {
  const transformToQueryFunction = customQueryValuesMap[fieldKey];

  if (transformToQueryFunction) {
    return transformToQueryFunction(value);
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (value) {
    return [value.toString()];
  }
};

export const convertModalInputsToFilterState = (
  searchInputs: AdvancedSearchQueryInputs,
): Partial<KubevirtFilterState> => {
  const filterState: Partial<KubevirtFilterState> = {};

  Object.entries(searchInputs).forEach(([fieldKey, value]) => {
    if (isEmpty(value)) {
      return;
    }

    const queryValues = createQueryValues(value, fieldKey);

    if (!isEmpty(queryValues)) {
      filterState[fieldKey] = queryValues;
    }
  });

  return filterState;
};

export const convertQueryToFilterState = (query: string): Partial<KubevirtFilterState> => {
  const params = new URLSearchParams(query);
  const filterState: Partial<KubevirtFilterState> = {};

  for (const key of params.keys()) {
    if (validSearchQueryParams.includes(key)) {
      filterState[key] = params.getAll(key);
    }
  }

  return filterState;
};

export const getRowFilterQueryKey = (fieldKey: string) =>
  skipRowFilterPrefix.has(fieldKey as VirtualMachineRowFilterType)
    ? fieldKey
    : `${ROW_FILTERS_PREFIX}${fieldKey}`;

export const getUrlSearchQuery = (search: string): string => {
  const allParams = new URLSearchParams(search);
  const searchParams = new URLSearchParams();

  for (const key of allParams.keys()) {
    if (validSearchQueryParams.includes(key)) {
      searchParams.set(key, allParams.get(key));
    }
  }

  return searchParams.toString();
};

export const buildContextSearchInputs = (
  cluster?: string,
  namespace?: string,
): AdvancedSearchQueryInputs => ({
  ...(cluster && { [VirtualMachineRowFilterType.Cluster]: [cluster] }),
  ...(namespace && { [VirtualMachineRowFilterType.Project]: [namespace] }),
});
