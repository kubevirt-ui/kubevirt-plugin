import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base';

import { DiagnosticSort } from '../utils/types';

import useDiagnosticSort from './useDiagnosticSort';

type DiagnosticColumn = {
  title: string;
  id: string;
  sort: (columnIndex: any) => ThSortType;
};

type UseDiagnosticConditionsTableColumns = () => [
  columns: TableColumn<DiagnosticColumn>[],
  activeColumns: TableColumn<DiagnosticColumn>[],
  sort: DiagnosticSort,
];

const useDiagnosticConditionsTableColumns: UseDiagnosticConditionsTableColumns = () => {
  const { t } = useKubevirtTranslation();
  const { getSorting, sort } = useDiagnosticSort();

  const columns: TableColumn<DiagnosticColumn>[] = [
    {
      title: t('Type'),
      id: 'type',
      cell: { sort: (columnIndex) => getSorting('type', columnIndex) },
    },
    {
      title: t('Status'),
      id: 'status',
      cell: { sort: (columnIndex) => getSorting('status', columnIndex) },
    },
    {
      title: t('Reason'),
      id: 'reason',
      cell: { sort: (columnIndex) => getSorting('reason', columnIndex) },
    },
    {
      title: t('Message'),
      id: 'message',

      cell: { sort: (columnIndex) => getSorting('message', columnIndex) },
    },
  ];

  const [activeColumns] = useKubevirtUserSettingsTableColumns<DiagnosticColumn>({
    columns,
    columnManagementID: 'diagnostic-tab-status',
  });

  return [columns, activeColumns, sort];
};

export default useDiagnosticConditionsTableColumns;
