import { isEmpty } from '@kubevirt-utils/utils/utils';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

import useKubevirtUserSettings from './useKubevirtUserSettings';

type UseKubevirtUserSettingsTableColumnsType = <T>(input: {
  columnManagementID: string;
  columns: TableColumn<T>[];
}) => [
  activeColumns: TableColumn<T>[],
  setActiveColumns: (val: any) => void,
  loaded: boolean,
  error: Error,
];

const useKubevirtUserSettingsTableColumns: UseKubevirtUserSettingsTableColumnsType = ({
  columnManagementID,
  columns,
}) => {
  const [userColumns, setUserColumns, loadedColumns, error] = useKubevirtUserSettings('columns');

  const setActiveColumns = (columnIds: string[]) => {
    setUserColumns?.({
      ...userColumns,
      [columnManagementID]: columnIds,
    });
  };

  const activeColumns = columns?.filter((col) =>
    userColumns?.[columnManagementID]?.includes(col?.id),
  );

  return [
    !isEmpty(activeColumns) ? activeColumns : columns,
    setActiveColumns,
    loadedColumns,
    error,
  ];
};

export default useKubevirtUserSettingsTableColumns;
