import { ROW_FILTERS_PREFIX } from '@kubevirt-utils/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { skipRowFilterPrefix, validSearchQueryParams } from './constants';
import { AdvancedSearchQueryInputs } from './types';

type AdvancedSearchQueryInputValue = AdvancedSearchQueryInputs[keyof AdvancedSearchQueryInputs];

const transformObjectToQueryValues = (object: Record<string, boolean>) =>
  Object.keys(object).filter((key) => object[key]);

const customQueryValuesMap: Record<string, (value: AdvancedSearchQueryInputValue) => string[]> = {
  [VirtualMachineRowFilterType.CPU]: (
    vCPU: AdvancedSearchQueryInputs[VirtualMachineRowFilterType.CPU],
  ) => (!isNaN(vCPU?.value) ? [`${vCPU.operator} ${vCPU.value}`] : []),
  [VirtualMachineRowFilterType.HWDevices]: (
    hwDevices: AdvancedSearchQueryInputs[VirtualMachineRowFilterType.HWDevices],
  ) => transformObjectToQueryValues(hwDevices),
  [VirtualMachineRowFilterType.Memory]: (
    memory: AdvancedSearchQueryInputs[VirtualMachineRowFilterType.Memory],
  ) => (!isNaN(memory?.value) ? [`${memory.operator} ${memory.value} ${memory.unit}`] : []),
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

export const generateQueryParams = (searchInputs: AdvancedSearchQueryInputs) => {
  const queryArgs: Record<string, string[]> = {};

  Object.entries(searchInputs).forEach(([fieldKey, value]) => {
    if (isEmpty(value)) {
      return;
    }

    const queryValues = createQueryValues(value, fieldKey);

    if (!isEmpty(queryValues)) {
      queryArgs[fieldKey] = queryValues;
    }
  });

  return queryArgs;
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
