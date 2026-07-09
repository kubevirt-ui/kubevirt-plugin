import { isEmpty } from '@kubevirt-utils/utils/utils';
import { TableColumnWithOptionalIndex } from '@virtualmachines/wizard/steps/InstanceTypesSteps/BootSourceStep/types';

import useKubevirtUserSettings from './useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from './utils/const';

type UseKubevirtUserSettingsTableColumnsType = <T>(input: {
  columnManagementID: string;
  columns: TableColumnWithOptionalIndex<T>[];
}) => [
  activeColumns: TableColumnWithOptionalIndex<T>[],
  setActiveColumns: (val: any) => void,
  loaded: boolean,
  error: Error,
];

const useKubevirtUserSettingsTableColumns: UseKubevirtUserSettingsTableColumnsType = ({
  columnManagementID,
  columns,
}) => {
  const [userColumns, setUserColumns, loadedColumns, error] = useKubevirtUserSettings(
    USER_SETTINGS_KEYS.columns,
  );

  const setActiveColumns = (columnIds: string[]) => {
    setUserColumns?.({
      ...userColumns,
      [columnManagementID]: columnIds,
    });
  };

  const activeColumns = columns?.filter((col) =>
    userColumns?.[columnManagementID]
      ? userColumns?.[columnManagementID]?.includes(col?.id)
      : !col?.additional,
  );

  return [
    !isEmpty(activeColumns) ? activeColumns : columns,
    setActiveColumns,
    loadedColumns,
    error,
  ];
};

export default useKubevirtUserSettingsTableColumns;
