import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

import { DiagnosticColumn, DiagnosticSort } from '../utils/types';

import useDiagnosticSort from './useDiagnosticSort';

type UseDiagnosticVolumeStatusTableColumnsResult = {
  activeColumns: TableColumn<DiagnosticColumn>[];
  columns: TableColumn<DiagnosticColumn>[];
  sorting: DiagnosticSort;
};

const useDiagnosticVolumeStatusTableColumns = (): UseDiagnosticVolumeStatusTableColumnsResult => {
  const { t } = useKubevirtTranslation();
  const { getSorting, sort } = useDiagnosticSort();

  const columns: TableColumn<DiagnosticColumn>[] = [
    {
      cell: { sort: (columnIndex) => getSorting('name', columnIndex) },
      id: 'name',
      title: t('Volume name'),
    },
    {
      cell: { sort: (columnIndex) => getSorting('enabled', columnIndex) },
      id: 'enabled',
      title: t('Snapshot enabled'),
    },
    {
      cell: { sort: (columnIndex) => getSorting('reason', columnIndex) },
      id: 'reason',
      title: t('Reason'),
    },
    {
      cell: { sort: (columnIndex) => getSorting('message', columnIndex) },
      id: 'message',
      title: t('Details'),
    },
  ];

  const [activeColumns] = useKubevirtUserSettingsTableColumns<DiagnosticColumn>({
    columnManagementID: 'diagnostic-tab-volume',
    columns,
  });

  return { activeColumns, columns, sorting: sort };
};

export default useDiagnosticVolumeStatusTableColumns;
