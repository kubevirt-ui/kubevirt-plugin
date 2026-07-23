import { CAPACITY_UNITS } from '@kubevirt-utils/components/CapacityInput/utils';
import { KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { NumberOperator, ROW_FILTERS_PREFIX } from '@kubevirt-utils/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  initialGuestAgent,
  initialHWDevices,
  initialScheduling,
} from '@search/components/AdvancedSearchModal/constants/initialValues';
import { filtersToSearchText } from '@search/searchLanguage/filtersToSearchText';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import {
  arrayFields,
  singleStringFields,
  skipRowFilterPrefix,
  validSearchQueryParams,
} from './constants';
import { AdvancedSearchQueryInputs, CPUValue, MemoryValue } from './types';

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
      filterState[key] = [...new Set(params.getAll(key))];
    }
    // Handle legacy filter params
    else if (key.startsWith(ROW_FILTERS_PREFIX)) {
      const filterKey = key.slice(ROW_FILTERS_PREFIX.length);
      if (validSearchQueryParams.includes(filterKey)) {
        filterState[filterKey] = [...new Set(params.getAll(key).flatMap((v) => v.split(',')))];
      }
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

  const sortEntry = ([kA, vA]: [string, string], [kB, vB]: [string, string]) =>
    kA.localeCompare(kB) || vA.localeCompare(vB);

  entriesA.sort(sortEntry);
  entriesB.sort(sortEntry);

  return entriesA.every(([key, value], i) => entriesB[i][0] === key && entriesB[i][1] === value);
};

const parseCPUValue = (values: string[]): CPUValue | undefined => {
  const parts = values[0]?.split(' ');
  if (parts?.length !== 2) return undefined;

  const operator = Object.values(NumberOperator).find((op) => op === parts[0]);
  const value = Number(parts[1]);

  if (!operator || isNaN(value)) return undefined;
  return { operator, value };
};

const parseMemoryValue = (values: string[]): MemoryValue | undefined => {
  const parts = values[0]?.split(' ');
  if (parts?.length !== 3) return undefined;

  const operator = Object.values(NumberOperator).find((op) => op === parts[0]);
  const value = Number(parts[1]);
  const unit = Object.values(CAPACITY_UNITS).find((u) => u === parts[2]);

  if (!operator || isNaN(value) || !unit) return undefined;
  return { operator, unit, value };
};

const parseBooleanMap = <T extends Record<string, boolean>>(values: string[], initial: T): T => {
  const result = { ...initial };
  for (const key of values) {
    if (key in result) {
      (result as Record<string, boolean>)[key] = true;
    }
  }
  return result;
};

export const convertFilterStateToModalInputs = (
  filters: Partial<KubevirtFilterState>,
): AdvancedSearchQueryInputs => {
  const result: AdvancedSearchQueryInputs = {};

  for (const [key, values] of Object.entries(filters)) {
    if (!validSearchQueryParams.includes(key) || isEmpty(values)) continue;

    if (singleStringFields.has(key as VirtualMachineRowFilterType)) {
      result[key] = values[0] ?? '';
    } else if (arrayFields.has(key as VirtualMachineRowFilterType)) {
      result[key] = values;
    } else if (key === VirtualMachineRowFilterType.CPU) {
      const parsed = parseCPUValue(values);
      if (parsed) result[key] = parsed;
    } else if (key === VirtualMachineRowFilterType.Memory) {
      const parsed = parseMemoryValue(values);
      if (parsed) result[key] = parsed;
    } else if (key === VirtualMachineRowFilterType.GuestAgent) {
      result[key] = parseBooleanMap(values, initialGuestAgent);
    } else if (key === VirtualMachineRowFilterType.HWDevices) {
      result[key] = parseBooleanMap(values, initialHWDevices);
    } else if (key === VirtualMachineRowFilterType.Scheduling) {
      result[key] = parseBooleanMap(values, initialScheduling);
    }
  }

  return result;
};

export const buildContextSearchInputs = (
  cluster?: string,
  namespace?: string,
): AdvancedSearchQueryInputs => ({
  ...(cluster && { [VirtualMachineRowFilterType.Cluster]: [cluster] }),
  ...(namespace && { [VirtualMachineRowFilterType.Project]: [namespace] }),
});
