import { BootableVolume } from '@catalog/CreateFromInstanceTypes/utils/types';
import { DataSourceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { ColumnLayout } from '@openshift-console/dynamic-plugin-sdk-internal/lib/extensions/console-types';

type UseBootVolumesColumns = (isModal: boolean) => {
  columns: TableColumn<BootableVolume>[];
  activeColumns: TableColumn<BootableVolume>[];
  columnLayout: ColumnLayout | null;
};

const useBootVolumeColumns: UseBootVolumesColumns = (isModal) => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<BootableVolume>[] = [
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

  const [activeColumns] = useKubevirtUserSettingsTableColumns<BootableVolume>({
    columns,
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
