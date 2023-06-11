import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

const useDiagnosticFilter = (): RowFilter[] => {
  const { t } = useKubevirtTranslation();

  const categoryFilter = {
    filter: (selectedItems, obj) => {
      return (
        selectedItems?.selected?.length === 0 ||
        selectedItems?.selected?.includes(obj?.metadata?.type)
      );
    },
    filterGroupName: t('Category'),
    items: [
      { id: 'VirtualMachines', title: t('VirtualMachines') },
      { id: 'Network', title: t('Network') },
      { id: 'Storage', title: t('Storage') },
    ],
    reducer: (obj) => {
      if (obj?.metadata?.type) return obj?.metadata?.type;
      return 'Network';
    },
    type: 'category',
  };

  const conditionsFilter = {
    filter: (selectedItems, obj) => {
      return (
        selectedItems?.selected?.length === 0 ||
        selectedItems?.selected?.includes(obj?.metadata?.condition)
      );
    },
    filterGroupName: t('Conditions'),
    items: [
      { id: 'Error', title: t('Error') },
      { id: 'Other', title: t('Other') },
    ],
    reducer: (obj) => {
      if (obj?.status === 'False') return 'Error';
      return 'Other';
    },
    type: 'conditions',
  };

  return [categoryFilter, conditionsFilter];
};

export default useDiagnosticFilter;
