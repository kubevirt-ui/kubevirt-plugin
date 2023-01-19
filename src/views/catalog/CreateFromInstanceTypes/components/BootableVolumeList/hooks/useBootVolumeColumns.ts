import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

const useBootVolumeColumns = () => {
  const { t } = useKubevirtTranslation();
  const columns: TableColumn<V1beta1DataSource>[] = [
    {
      title: t('Volume name'),
      id: 'volume-name',
    },
    {
      title: t('Operating system'),
      id: 'operating-system',
    },
    {
      title: t('Description'),
      id: 'description',
    },
  ];

  return columns;
};

export default useBootVolumeColumns;
