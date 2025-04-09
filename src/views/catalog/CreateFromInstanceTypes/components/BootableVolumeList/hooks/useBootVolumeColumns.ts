import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { ColumnLayout } from '@openshift-console/dynamic-plugin-sdk-internal/lib/extensions/console-types';

import {
  DESCRIPTION_COLUMN_ID,
  FAVORITES_COLUMN_ID,
  NAME_COLUMN_ID,
  NAMESPACE_COLUMN_ID,
  OPERATING_SYSTEM_COLUMN_ID,
  SIZE_COLUMN_ID,
  STORAGE_CLASS_COLUMN_ID,
} from '../utils/constants';

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
      id: FAVORITES_COLUMN_ID,
      title: '',
    },
    {
      id: NAME_COLUMN_ID,
      title: t('Volume name'),
    },
    ...(volumeListNamespace === ALL_PROJECTS
      ? [
          {
            id: NAMESPACE_COLUMN_ID,
            title: t('Namespace'),
          },
        ]
      : []),
    {
      id: OPERATING_SYSTEM_COLUMN_ID,
      title: t('Operating system'),
    },
    {
      id: STORAGE_CLASS_COLUMN_ID,
      title: t('Storage class'),
    },
    {
      id: SIZE_COLUMN_ID,
      title: t('Size'),
    },
    {
      id: DESCRIPTION_COLUMN_ID,
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
