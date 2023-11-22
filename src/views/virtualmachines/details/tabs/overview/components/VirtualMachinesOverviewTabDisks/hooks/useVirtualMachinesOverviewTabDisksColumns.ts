import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

const useVirtualMachinesOverviewTabDisksColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<DiskRowDataLayout>[] = [
    {
      id: 'name',
      title: t('Name'),
    },
    {
      id: 'drive',
      title: t('Drive'),
    },
    {
      id: 'size',
      title: t('Size'),
    },
    {
      id: 'interface',
      title: t('Interface'),
    },
  ];

  return columns;
};

export default useVirtualMachinesOverviewTabDisksColumns;
