import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const getDateFilter = (
  t: TFunction,
  fromToOption: 'from' | 'to',
): RowFilter<V1VirtualMachine> => {
  const isFrom = fromToOption === 'from';

  return {
    filter: (input, obj) => {
      const dateString = input.selected?.[0];

      if (!dateString) {
        return true;
      }

      const dateCreatedString = obj.metadata?.creationTimestamp;

      return isFrom ? dateString <= dateCreatedString : dateString >= dateCreatedString;
    },
    filterGroupName: isFrom ? t('Date created from') : t('Date created to'),
    isMatch: () => true,
    items: [],
    type: isFrom
      ? VirtualMachineRowFilterType.DateCreatedFrom
      : VirtualMachineRowFilterType.DateCreatedTo,
  };
};
