import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';

import { DiagnosticSort } from '../utils/types';

import useDiagnosticSort from './useDiagnosticSort';

type DiagnosticColumn = {
  id: string;
  sort: (columnIndex: any) => ThSortType;
  title: string;
};

type UseDiagnosticDataVolumeStatusTableColumns = () => {
  activeColumns: TableColumn<DiagnosticColumn>[];
  columns: TableColumn<DiagnosticColumn>[];
  sorting: DiagnosticSort;
};
const useDiagnosticDataVolumeStatusTableColumns: UseDiagnosticDataVolumeStatusTableColumns = () => {
  const { t } = useKubevirtTranslation();
  const { getSorting, sort } = useDiagnosticSort();

  const columns: TableColumn<DiagnosticColumn>[] = [
    {
      cell: { sort: (columnIndex) => getSorting('name', columnIndex) },
      id: 'name',
      title: t('Name'),
    },
    {
      cell: { sort: (columnIndex) => getSorting('phase', columnIndex) },
      id: 'phase',
      title: t('Phase'),
    },
    {
      cell: { sort: (columnIndex) => getSorting('progress', columnIndex) },
      id: 'progress',
      title: t('Progress'),
    },
  ];

  const [activeColumns] = useKubevirtUserSettingsTableColumns<DiagnosticColumn>({
    columnManagementID: 'diagnostic-tab-data-volume',
    columns,
  });

  return { activeColumns, columns, sorting: sort };
};

export default useDiagnosticDataVolumeStatusTableColumns;
