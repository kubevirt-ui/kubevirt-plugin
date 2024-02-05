import { useCallback, useEffect } from 'react';

import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { KUBEVIRT_V1_VIRTUALMACHINE } from '@kubevirt-utils/constants/constants';
import { TableColumn, useActiveColumns } from '@openshift-console/dynamic-plugin-sdk';
import { useUserSettings } from '@openshift-console/dynamic-plugin-sdk-internal';

import useKubevirtUserSettings from './useKubevirtUserSettings';

type UseKubevirtUserSettingsTableColumnsType = <T>(input: {
  columnManagementID;
  columns;
}) => [
  activeColumns: TableColumn<T>[],
  setActiveColumns: (val: any) => void,
  loaded: boolean,
  error: Error,
];

const useKubevirtUserSettingsTableColumns: UseKubevirtUserSettingsTableColumnsType = <T>({
  columnManagementID,
  columns,
}) => {
  const [userColumns, setUserColumns, loaded, error] = useKubevirtUserSettings('columns');
  const [localStorageSettings, setLocalStorageSettings] = useUserSettings<{
    [key: string]: string;
  }>('console.tableColumns');

  const [activeColumns] = useActiveColumns<T>({
    columnManagementID,
    columns,
    showNamespaceOverride: false,
  });

  useEffect(() => {
    if (!loaded || error) return;

    if (
      !isEqualObject(
        userColumns?.[columnManagementID],
        localStorageSettings?.[columnManagementID],
      ) &&
      columnManagementID === KUBEVIRT_V1_VIRTUALMACHINE
    ) {
      setLocalStorageSettings({
        ...localStorageSettings,
        [columnManagementID]: userColumns?.[columnManagementID],
      });
    }

    if (userColumns?.[columnManagementID] === undefined && activeColumns?.length > 0) {
      setUserColumns?.({
        ...userColumns,
        [columnManagementID]: activeColumns.map((col) => col?.id),
      });
    }
  }, [
    activeColumns,
    columnManagementID,
    localStorageSettings,
    setLocalStorageSettings,
    setUserColumns,
    userColumns,
    loaded,
    error,
  ]);

  const setActiveColumns = useCallback(
    (columnIds: string[]) =>
      setUserColumns?.({
        ...userColumns,
        [columnManagementID]: columnIds,
      }),
    [columnManagementID, setUserColumns, userColumns],
  );

  return [activeColumns, setActiveColumns, loaded, error];
};

export default useKubevirtUserSettingsTableColumns;
