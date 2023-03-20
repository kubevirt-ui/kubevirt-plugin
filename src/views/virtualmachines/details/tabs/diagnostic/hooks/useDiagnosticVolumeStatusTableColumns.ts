import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn, useActiveColumns } from '@openshift-console/dynamic-plugin-sdk';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base';

import { DiagnosticSort } from '../utils/types';

import useDiagnosticSort from './useDiagnosticSort';

type DiagnosticColumn = {
  title: string;
  id: string;
  sort: (columnIndex: any) => ThSortType;
};

type UseDiagnosticVolumeStatusTableColumns = () => {
  columns: TableColumn<DiagnosticColumn>[];
  activeColumns: TableColumn<DiagnosticColumn>[];
  sorting: DiagnosticSort;
};
const useDiagnosticVolumeStatusTableColumns: UseDiagnosticVolumeStatusTableColumns = () => {
  const { t } = useKubevirtTranslation();
  const { getSorting, sort } = useDiagnosticSort();

  const columns: TableColumn<DiagnosticColumn>[] = [
    {
      title: t('Name'),
      id: 'name',
      cell: { sort: (columnIndex) => getSorting('name', columnIndex) },
    },
    {
      title: t('Enabled'),
      id: 'enabled',
      cell: { sort: (columnIndex) => getSorting('enabled', columnIndex) },
    },
    {
      title: t('Reason'),
      id: 'reason',
      cell: { sort: (columnIndex) => getSorting('reason', columnIndex) },
    },
  ];

  const [activeColumns] = useActiveColumns({
    columns,
    showNamespaceOverride: false,
    columnManagementID: 'diagnostic-tab-volume',
  });

  return { columns, activeColumns, sorting: sort };
};

export default useDiagnosticVolumeStatusTableColumns;
