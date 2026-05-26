import { NAME_COLUMN_ID } from '@kubevirt-utils/components/ColumnManagementModal/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

import { DiagnosticColumn, DiagnosticSort } from '../utils/types';

import useDiagnosticSort from './useDiagnosticSort';

type UseDiagnosticDataVolumeStatusTableColumnsResult = {
  activeColumns: TableColumn<DiagnosticColumn>[];
  columns: TableColumn<DiagnosticColumn>[];
  sorting: DiagnosticSort;
};

const useDiagnosticDataVolumeStatusTableColumns =
  (): UseDiagnosticDataVolumeStatusTableColumnsResult => {
    const { t } = useKubevirtTranslation();
    const { getSorting, sort } = useDiagnosticSort();

    const columns: TableColumn<DiagnosticColumn>[] = [
      {
        cell: { sort: (columnIndex) => getSorting(NAME_COLUMN_ID, columnIndex) },
        id: NAME_COLUMN_ID,
        title: t('DataVolume name'),
      },
      {
        cell: { sort: (columnIndex) => getSorting('phase', columnIndex) },
        id: 'phase',
        title: t('Import phase'),
      },
      {
        cell: { sort: (columnIndex) => getSorting('progress', columnIndex) },
        id: 'progress',
        title: t('Progress'),
      },
      {
        cell: { sort: (columnIndex) => getSorting('message', columnIndex) },
        id: 'message',
        title: t('Details'),
      },
    ];

    const [activeColumns] = useKubevirtUserSettingsTableColumns<DiagnosticColumn>({
      columnManagementID: 'diagnostic-tab-data-volume',
      columns,
    });

    return { activeColumns, columns, sorting: sort };
  };

export default useDiagnosticDataVolumeStatusTableColumns;
