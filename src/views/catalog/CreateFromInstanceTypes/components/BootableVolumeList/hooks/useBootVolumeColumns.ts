import { DataSourceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { ColumnLayout } from '@openshift-console/dynamic-plugin-sdk-internal/lib/extensions/console-types';

type UseBootVolumesColumns = (isModal: boolean) => {
  activeColumns: TableColumn<BootableVolume>[];
  columnLayout: ColumnLayout | null;
  columns: TableColumn<BootableVolume>[];
};

const useBootVolumeColumns: UseBootVolumesColumns = (isModal) => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<BootableVolume>[] = [
    {
      id: 'name',
      title: t('Volume name'),
    },
    {
      id: 'operating-system',
      title: t('Operating system'),
    },
    {
      id: 'storage-class',
      title: t('Storage class'),
    },
    {
      id: 'size',
      title: t('Size'),
    },
    {
      id: 'description',
      title: t('Description'),
    },
  ];

  const [activeColumns] = useKubevirtUserSettingsTableColumns<BootableVolume>({
    columnManagementID: DataSourceModelRef,
    columns,
  });

  const columnLayout: ColumnLayout = {
    columns: columns?.map(({ additional, id, title }) => ({
      additional,
      id,
      title,
    })),
    id: DataSourceModelRef,
    selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
    showNamespaceOverride: true,
    type: t('Bootable volumes'),
  };

  return { activeColumns, columnLayout: isModal ? null : columnLayout, columns };
};

export default useBootVolumeColumns;
