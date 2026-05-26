import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

import { DiagnosticColumn, DiagnosticSort } from '../utils/types';

import useDiagnosticSort from './useDiagnosticSort';

type UseDiagnosticConditionsTableColumnsResult = {
  activeColumns: TableColumn<DiagnosticColumn>[];
  columns: TableColumn<DiagnosticColumn>[];
  loaded: boolean;
  sorting: DiagnosticSort;
};

const useDiagnosticConditionsTableColumns = (): UseDiagnosticConditionsTableColumnsResult => {
  const { t } = useKubevirtTranslation();
  const { getSorting, sort } = useDiagnosticSort();

  const columns: TableColumn<DiagnosticColumn>[] = [
    {
      cell: { sort: (columnIndex) => getSorting('type', columnIndex) },
      id: 'type',
      title: t('Condition type'),
    },
    {
      cell: { sort: (columnIndex) => getSorting('status', columnIndex) },
      id: 'status',
      title: t('Condition'),
    },
    {
      cell: { sort: (columnIndex) => getSorting('reason', columnIndex) },
      id: 'reason',
      title: t('Reason'),
    },
    {
      cell: { sort: (columnIndex) => getSorting('lastTransitionTime', columnIndex) },
      id: 'lastTransitionTime',
      title: t('Last transition'),
    },
    {
      cell: { sort: (columnIndex) => getSorting('message', columnIndex) },
      id: 'message',
      title: t('Technical message'),
    },
  ];

  const [activeColumns, , loaded] = useKubevirtUserSettingsTableColumns<DiagnosticColumn>({
    columnManagementID: 'diagnostic-tab-status',
    columns,
  });

  return { activeColumns, columns, loaded, sorting: sort };
};

export default useDiagnosticConditionsTableColumns;
