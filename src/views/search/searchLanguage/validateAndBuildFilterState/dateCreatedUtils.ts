import { KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import {
  isDateCreatedQuickValue,
  isFromValue,
  isToValue,
  isValidDateString,
  stripFromPrefix,
  stripToPrefix,
} from '@search/utils/dateCreatedValues';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { setFilter } from './utils';

const tryValidateDate = (
  raw: string,
  stripPrefix: (v: string) => string,
  filterState: Partial<KubevirtFilterState>,
  tokenOrder: string[],
  filterKey: string,
): boolean => {
  const dateStr = stripPrefix(raw);
  if (!isValidDateString(dateStr)) return false;
  setFilter(filterState, tokenOrder, filterKey, dateStr);
  return true;
};

const validateFromToDateValue = (
  value: string,
  fromVal: string | undefined,
  toVal: string | undefined,
  filterState: Partial<KubevirtFilterState>,
  tokenOrder: string[],
): boolean => {
  if (value === fromVal) {
    return tryValidateDate(
      value,
      stripFromPrefix,
      filterState,
      tokenOrder,
      VirtualMachineRowFilterType.DateCreatedFrom,
    );
  }

  if (value === toVal) {
    return tryValidateDate(
      value,
      stripToPrefix,
      filterState,
      tokenOrder,
      VirtualMachineRowFilterType.DateCreatedTo,
    );
  }

  return false;
};

const validateFromToMode = (
  values: string[],
  filterState: Partial<KubevirtFilterState>,
  tokenOrder: string[],
): string[] => {
  const fromVal = values.find(isFromValue);
  const toVal = values.find(isToValue);
  const invalid: string[] = [];

  for (const value of values) {
    const isValid = validateFromToDateValue(value, fromVal, toVal, filterState, tokenOrder);
    if (!isValid) invalid.push(value);
  }

  return invalid;
};

const validateQuickValueMode = (
  values: string[],
  filterState: Partial<KubevirtFilterState>,
  tokenOrder: string[],
): string[] => {
  const [first, ...rest] = values;
  const invalid = [...rest];

  if (!first) return invalid;

  if (isDateCreatedQuickValue(first)) {
    setFilter(
      filterState,
      tokenOrder,
      VirtualMachineRowFilterType.DateCreated,
      first.toLowerCase(),
    );
    return invalid;
  }

  invalid.push(first);
  return invalid;
};

const isFromToMode = (values: string[]): boolean =>
  values.some(isFromValue) || values.some(isToValue);

export const validateDateCreatedValues = (
  values: string[],
  filterState: Partial<KubevirtFilterState>,
  tokenOrder: string[],
): string[] =>
  isFromToMode(values)
    ? validateFromToMode(values, filterState, tokenOrder)
    : validateQuickValueMode(values, filterState, tokenOrder);
