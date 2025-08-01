import { isEmpty } from '@kubevirt-utils/utils/utils';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { skipRowFilterPrefix } from './constants';
import { AdvancedSearchQueryInputs } from './types';

type AdvancedSearchQueryInputValue = AdvancedSearchQueryInputs[keyof AdvancedSearchQueryInputs];

const transformObjectToQueryString = (object: Record<string, boolean>) => {
  const truthyKeys = Object.keys(object).filter((key) => object[key]);
  return isEmpty(truthyKeys) ? undefined : truthyKeys.join(',');
};

const customQueryStringMap: Record<
  string,
  (value: AdvancedSearchQueryInputValue) => string | undefined
> = {
  [VirtualMachineRowFilterType.CPU]: (
    vCPU: AdvancedSearchQueryInputs[VirtualMachineRowFilterType.CPU],
  ) => (!isNaN(vCPU?.value) ? `${vCPU.operator} ${vCPU.value}` : undefined),
  [VirtualMachineRowFilterType.HWDevices]: (
    hwDevices: AdvancedSearchQueryInputs[VirtualMachineRowFilterType.HWDevices],
  ) => transformObjectToQueryString(hwDevices),
  [VirtualMachineRowFilterType.Memory]: (
    memory: AdvancedSearchQueryInputs[VirtualMachineRowFilterType.Memory],
  ) => (!isNaN(memory?.value) ? `${memory.operator} ${memory.value} ${memory.unit}` : undefined),
  [VirtualMachineRowFilterType.Scheduling]: (
    scheduling: AdvancedSearchQueryInputs[VirtualMachineRowFilterType.Scheduling],
  ) => transformObjectToQueryString(scheduling),
};

const createQueryString = (
  value: AdvancedSearchQueryInputValue,
  fieldKey: string,
): string | undefined => {
  const transformToQueryFunction = customQueryStringMap[fieldKey];

  if (transformToQueryFunction) {
    return transformToQueryFunction(value);
  }

  if (Array.isArray(value)) {
    return isEmpty(value) ? undefined : value.join(',');
  }

  if (value) {
    return value.toString();
  }
};

export const generateQueryParams = (searchInputs: AdvancedSearchQueryInputs) => {
  const queryArgs: Record<string, string> = {};

  Object.entries(searchInputs).forEach(([fieldKey, value]) => {
    if (isEmpty(value)) {
      return;
    }

    const queryString = createQueryString(value, fieldKey);

    if (queryString) {
      const queryKey = getRowFilterQueryKey(fieldKey);
      queryArgs[queryKey] = queryString;
    }
  });

  return queryArgs;
};

export const getRowFilterQueryKey = (fieldKey: string) =>
  skipRowFilterPrefix.has(fieldKey as VirtualMachineRowFilterType)
    ? fieldKey
    : `rowFilter-${fieldKey}`;
