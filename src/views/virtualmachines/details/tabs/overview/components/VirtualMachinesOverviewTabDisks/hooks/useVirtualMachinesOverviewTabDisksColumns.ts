import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

const useVirtualMachinesOverviewTabDisksColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<DiskRowDataLayout>[] = [
    {
      title: t('Name'),
      id: 'name',
    },
    {
      title: t('Drive'),
      id: 'drive',
    },
    {
      title: t('Size'),
      id: 'size',
    },
  ];

  return columns;
};

export default useVirtualMachinesOverviewTabDisksColumns;
