import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { ColumnLayout } from '@openshift-console/dynamic-plugin-sdk-internal/lib/extensions/console-types';

type UseBootVolumesColumns = (
  volumeListNamespace: string,
  isModal: boolean,
) => {
  activeColumns: TableColumn<BootableVolume>[];
  columnLayout: ColumnLayout | null;
  columns: TableColumn<BootableVolume>[];
  loadedColumns: boolean;
};

const useBootVolumeColumns: UseBootVolumesColumns = (volumeListNamespace, isModal) => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<BootableVolume>[] = [
    {
      id: 'favorites',
      title: '',
    },
    {
      id: 'name',
      title: t('Volume name'),
    },
    ...(volumeListNamespace === ALL_PROJECTS
      ? [
          {
            id: 'namespace',
            title: t('Namespace'),
          },
        ]
      : []),
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

  const [activeColumns, , loadedColumns] = useKubevirtUserSettingsTableColumns<BootableVolume>({
    columnManagementID: 'BootableVolumeCatalog',
    columns,
  });

  const columnLayout: ColumnLayout = {
    columns: columns?.map(({ additional, id, title }) => ({
      additional,
      id,
      title,
    })),
    id: 'BootableVolumeCatalog',
    selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
    showNamespaceOverride: true,
    type: t('Bootable volumes'),
  };

  return { activeColumns, columnLayout: isModal ? null : columnLayout, columns, loadedColumns };
};

export default useBootVolumeColumns;
