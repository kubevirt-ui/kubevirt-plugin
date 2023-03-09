import { DataSourceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn, useActiveColumns } from '@openshift-console/dynamic-plugin-sdk';
import { ColumnLayout } from '@openshift-console/dynamic-plugin-sdk-internal/lib/extensions/console-types';

type UseBootVolumesColumns = (isModal: boolean) => {
  columns: TableColumn<V1beta1DataSource>[];
  activeColumns: TableColumn<V1beta1DataSource>[];
  columnLayout: ColumnLayout | null;
};

const useBootVolumeColumns: UseBootVolumesColumns = (isModal) => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<V1beta1DataSource>[] = [
    {
      title: t('Volume name'),
      id: 'name',
    },
    {
      title: t('Operating system'),
      id: 'operating-system',
    },
    {
      title: t('Storage class'),
      id: 'storage-class',
    },
    {
      title: t('Size'),
      id: 'size',
    },
    {
      title: t('Description'),
      id: 'description',
    },
  ];

  const [activeColumns] = useActiveColumns<V1beta1DataSource>({
    columns,
    showNamespaceOverride: false,
    columnManagementID: DataSourceModelRef,
  });

  const columnLayout: ColumnLayout = {
    columns: columns?.map(({ id, title, additional }) => ({
      id,
      title,
      additional,
    })),
    id: DataSourceModelRef,
    selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
    type: t('Bootable volumes'),
  };

  return { columns, activeColumns, columnLayout: isModal ? null : columnLayout };
};

export default useBootVolumeColumns;
