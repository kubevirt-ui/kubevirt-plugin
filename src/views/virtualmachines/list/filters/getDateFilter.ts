import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { getCreationTimestamp } from '@kubevirt-utils/resources/shared';
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

export const getDateFromFilter = (t: TFunction): KubevirtFilter<V1VirtualMachine> => {
  return {
    categoryLabel: t('Date created from'),
    filterLayout: KubevirtFilterLayout.HIDDEN,
    id: VirtualMachineRowFilterType.DateCreatedFrom,
    match: getMatchDateFunction(DATE_VARIANT.FROM),
  };
};

export const getDateToFilter = (t: TFunction): KubevirtFilter<V1VirtualMachine> => {
  return {
    categoryLabel: t('Date created to'),
    filterLayout: KubevirtFilterLayout.HIDDEN,
    id: VirtualMachineRowFilterType.DateCreatedTo,
    match: getMatchDateFunction(DATE_VARIANT.TO),
  };
};
