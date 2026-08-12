import { type CAPACITY_UNITS } from '@kubevirt-utils/components/CapacityInput/utils';
import { type KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { type NumberOperator, ROW_FILTERS_PREFIX } from '@kubevirt-utils/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { filtersToSearchText } from '@search/searchLanguage/filtersToSearchText';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { skipRowFilterPrefix, validSearchQueryParams } from './constants';
import { type AdvancedSearchQueryInputs } from './types';

export * from './queryParsers';

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

  for (const [fieldKey, value] of Object.entries(searchInputs)) {
    if (isEmpty(value)) {
      continue;
    }

    const queryValues = createQueryValues(value, fieldKey);

    if (!isEmpty(queryValues)) {
      filterState[fieldKey] = queryValues;
    }
  }

  return filterState;
};

export const convertQueryToFilterState = (query: string): Partial<KubevirtFilterState> => {
  const params = new URLSearchParams(query);
  const filterState: Partial<KubevirtFilterState> = {};

  for (const key of params.keys()) {
    if (validSearchQueryParams.includes(key)) {
      filterState[key] = [...new Set(params.getAll(key))];
    }
    // Handle legacy filter params
    else if (key.startsWith(ROW_FILTERS_PREFIX)) {
      const filterKey = key.slice(ROW_FILTERS_PREFIX.length);
      if (validSearchQueryParams.includes(filterKey)) {
        filterState[filterKey] = [...new Set(params.getAll(key).flatMap((val) => val.split(',')))];
      }
    }
  }

  return filterState;
};

export const getRowFilterQueryKey = (fieldKey: string): string =>
  skipRowFilterPrefix.has(fieldKey as VirtualMachineRowFilterType)
    ? fieldKey
    : `${ROW_FILTERS_PREFIX}${fieldKey}`;

export const getUrlSearchQuery = (search: string): string => {
  const allParams = new URLSearchParams(search);
  const searchParams = new URLSearchParams();

  for (const [key, value] of allParams.entries()) {
    if (validSearchQueryParams.includes(key)) {
      searchParams.append(key, value);
    }
  }

  return searchParams.toString();
};

export const urlQueryToSearchLanguage = (urlSearchQuery: string): string => {
  const filterState = convertQueryToFilterState(urlSearchQuery);
  const tokenOrder = Object.keys(filterState);

  return filtersToSearchText(filterState, tokenOrder);
};

export const areQueriesEqual = (queryA: string, queryB: string): boolean => {
  const paramsA = new URLSearchParams(queryA);
  const paramsB = new URLSearchParams(queryB);

  const entriesA = [...paramsA.entries()];
  const entriesB = [...paramsB.entries()];

  if (entriesA.length !== entriesB.length) return false;

  const sortEntry = ([keyA, valA]: [string, string], [keyB, valB]: [string, string]): number =>
    keyA.localeCompare(keyB) || valA.localeCompare(valB);

  entriesA.sort(sortEntry);
  entriesB.sort(sortEntry);

  return entriesA.every(([key, value], i) => entriesB[i][0] === key && entriesB[i][1] === value);
};
