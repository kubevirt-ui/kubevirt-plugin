import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { ARCHITECTURE_ID, ARCHITECTURE_TITLE } from '@kubevirt-utils/utils/architecture';
import { ColumnLayout } from '@openshift-console/dynamic-plugin-sdk-internal/lib/extensions/console-types';

import { TableColumnWithOptionalIndex } from '../../../types';
import {
  DESCRIPTION_COLUMN_ID,
  NAME_COLUMN_ID,
  NAMESPACE_COLUMN_ID,
  OPERATING_SYSTEM_COLUMN_ID,
  SIZE_COLUMN_ID,
  STORAGE_CLASS_COLUMN_ID,
} from '../utils/constants';

type UseBootVolumesColumns = (volumeListNamespace: string) => {
  activeColumns: TableColumnWithOptionalIndex<BootableVolume>[];
  columnLayout: ColumnLayout;
  columns: TableColumnWithOptionalIndex<BootableVolume>[];
  loadedColumns: boolean;
};

const useBootVolumeColumns: UseBootVolumesColumns = (volumeListNamespace) => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumnWithOptionalIndex<BootableVolume>[] = [
    {
      columnIndex: 0,
      id: NAME_COLUMN_ID,
      title: t('Volume name'),
    },
    {
      columnIndex: 1,
      id: ARCHITECTURE_ID,
      title: ARCHITECTURE_TITLE,
    },
    ...(volumeListNamespace === ALL_PROJECTS
      ? [
          {
            columnIndex: 2,
            id: NAMESPACE_COLUMN_ID,
            title: t('Namespace'),
          },
        ]
      : []),
    {
      columnIndex: 3,
      id: OPERATING_SYSTEM_COLUMN_ID,
      title: t('Operating system'),
    },
    {
      columnIndex: 4,
      id: STORAGE_CLASS_COLUMN_ID,
      title: t('Storage class'),
    },
    {
      columnIndex: 5,
      id: SIZE_COLUMN_ID,
      title: t('Size'),
    },
    {
      columnIndex: 6,
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

  return {
    activeColumns,
    columnLayout,
    columns,
    loadedColumns,
  };
};

export default useBootVolumeColumns;
