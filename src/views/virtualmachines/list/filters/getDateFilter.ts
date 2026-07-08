import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { getCreationTimestamp } from '@kubevirt-utils/resources/shared';
import {
  DateSelectOption,
  dateSelectOptions,
  getDateSelectLabels,
} from '@search/components/AdvancedSearchModal/constants/dateSelect';
import {
  FROM_PREFIX,
  TO_PREFIX,
  getDateCreatedChipLabel,
  resolveDateCreatedValue,
} from '@search/utils/dateCreatedValues';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

enum DATE_VARIANT {
  FROM = 'from',
  TO = 'to',
}

const getMatchDateFunction =
  (variant: DATE_VARIANT) => (obj: V1VirtualMachine, selected: string[]) => {
    const dateString = selected[0];
    if (!dateString) return true;
    const dateCreatedString = getCreationTimestamp(obj);
    return variant === DATE_VARIANT.FROM
      ? dateString <= dateCreatedString
      : dateString >= dateCreatedString;
  };

const matchDateFrom = getMatchDateFunction(DATE_VARIANT.FROM);
const matchDateTo = getMatchDateFunction(DATE_VARIANT.TO);

export const getDateCreatedFilter = (t: TFunction): KubevirtFilter<V1VirtualMachine> => {
  const labels = getDateSelectLabels(t);

  return {
    categoryLabel: t('Date created'),
    filterLayout: KubevirtFilterLayout.HIDDEN,
    getChipLabel: (value) => getDateCreatedChipLabel(value, t),
    id: VirtualMachineRowFilterType.DateCreated,
    match: (obj, selected) => {
      const value = selected[0];
      if (!value) return true;

      const resolved = resolveDateCreatedValue(value);
      if (!resolved) return true;

      const fromMatch = matchDateFrom(obj, [resolved.from]);
      if (!fromMatch) return false;

      if (resolved.to) {
        return matchDateTo(obj, [resolved.to]);
      }

      return true;
    },
    options: [
      ...dateSelectOptions
        .filter((opt) => opt !== DateSelectOption.Custom)
        .map((opt) => ({ label: labels[opt], value: opt })),
      { label: t('From'), value: FROM_PREFIX },
      { label: t('To'), value: TO_PREFIX },
    ],
  };
};

export const getDateFromFilter = (t: TFunction): KubevirtFilter<V1VirtualMachine> => {
  return {
    categoryLabel: t('Date created from'),
    filterLayout: KubevirtFilterLayout.HIDDEN,
    id: VirtualMachineRowFilterType.DateCreatedFrom,
    match: matchDateFrom,
  };
};

export const getDateToFilter = (t: TFunction): KubevirtFilter<V1VirtualMachine> => {
  return {
    categoryLabel: t('Date created to'),
    filterLayout: KubevirtFilterLayout.HIDDEN,
    id: VirtualMachineRowFilterType.DateCreatedTo,
    match: matchDateTo,
  };
};
