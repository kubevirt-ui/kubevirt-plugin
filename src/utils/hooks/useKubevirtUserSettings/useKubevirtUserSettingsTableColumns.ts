import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type TableColumnWithOptionalIndex } from '@virtualmachines/wizard/steps/InstanceTypesSteps/BootSourceStep/types';

import useKubevirtUserSettings from './useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from './utils/const';
import { type UserSettingsState } from './utils/userSettingsInitialState';

type UseKubevirtUserSettingsTableColumnsType = <T>(input: {
  columnManagementID: string;
  columns: TableColumnWithOptionalIndex<T>[];
}) => [
  activeColumns: TableColumnWithOptionalIndex<T>[],
  setActiveColumns: (columnIds: string[]) => Promise<UserSettingsState['columns']> | undefined,
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

  const setActiveColumns = (
    columnIds: string[],
  ): Promise<UserSettingsState['columns']> | undefined => {
    return setUserColumns?.({
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
