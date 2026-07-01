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

export const validateDateCreatedValues = (
  values: string[],
  filterState: Partial<KubevirtFilterState>,
  tokenOrder: string[],
): string[] => {
  const invalid: string[] = [];
  const fromVal = values.find((v) => isFromValue(v));
  const toVal = values.find((v) => isToValue(v));
  const isFromToMode = !!fromVal || !!toVal;

  if (isFromToMode) {
    for (const val of values) {
      if (val === fromVal) {
        if (
          !tryValidateDate(
            val,
            stripFromPrefix,
            filterState,
            tokenOrder,
            VirtualMachineRowFilterType.DateCreatedFrom,
          )
        )
          invalid.push(val);
      } else if (val === toVal) {
        if (
          !tryValidateDate(
            val,
            stripToPrefix,
            filterState,
            tokenOrder,
            VirtualMachineRowFilterType.DateCreatedTo,
          )
        )
          invalid.push(val);
      } else {
        invalid.push(val);
      }
    }
  } else {
    const [first, ...rest] = values;
    invalid.push(...rest);
    if (first && isDateCreatedQuickValue(first)) {
      setFilter(
        filterState,
        tokenOrder,
        VirtualMachineRowFilterType.DateCreated,
        first.toLowerCase(),
      );
    } else if (first) {
      invalid.push(first);
    }
  }

  return invalid;
};
