import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const useDateFilter = (fromToOption: 'from' | 'to'): RowFilter => {
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
