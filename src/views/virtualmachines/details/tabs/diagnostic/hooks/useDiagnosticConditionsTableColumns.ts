import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base';

import { DiagnosticSort } from '../utils/types';

import useDiagnosticSort from './useDiagnosticSort';

type DiagnosticColumn = {
  id: string;
  sort: (columnIndex: any) => ThSortType;
  title: string;
};

type UseDiagnosticConditionsTableColumns = () => [
  columns: TableColumn<DiagnosticColumn>[],
  activeColumns: TableColumn<DiagnosticColumn>[],
  sort: DiagnosticSort,
  loadedColumns: boolean,
];

const useDiagnosticConditionsTableColumns: UseDiagnosticConditionsTableColumns = () => {
  const { t } = useKubevirtTranslation();
  const { getSorting, sort } = useDiagnosticSort();

  const columns: TableColumn<DiagnosticColumn>[] = [
    {
      cell: { sort: (columnIndex) => getSorting('type', columnIndex) },
      id: 'type',
      title: t('Type'),
    },
    {
      cell: { sort: (columnIndex) => getSorting('status', columnIndex) },
      id: 'status',
      title: t('Status'),
    },
    {
      cell: { sort: (columnIndex) => getSorting('reason', columnIndex) },
      id: 'reason',
      title: t('Reason'),
    },
    {
      cell: { sort: (columnIndex) => getSorting('message', columnIndex) },
      id: 'message',

      title: t('Message'),
    },
  ];

  const [activeColumns, , loadedColumns] = useKubevirtUserSettingsTableColumns<DiagnosticColumn>({
    columnManagementID: 'diagnostic-tab-status',
    columns,
  });

  return [columns, activeColumns, sort, loadedColumns];
};

export default useDiagnosticConditionsTableColumns;
