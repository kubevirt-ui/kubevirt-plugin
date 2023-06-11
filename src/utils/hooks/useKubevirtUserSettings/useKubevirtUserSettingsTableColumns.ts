import { useEffect, useRef } from 'react';

import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { useActiveColumns } from '@openshift-console/dynamic-plugin-sdk';
import { useUserSettings } from '@openshift-console/dynamic-plugin-sdk-internal';

import useKubevirtUserSettings from './useKubevirtUserSettings';

const useKubevirtUserSettingsTableColumns = <T>({ columnManagementID, columns }) => {
  const updateOnceFromUserSetting = useRef(null);
  const [userColumns, setUserColumns] = useKubevirtUserSettings('columns');
  const [localStorageSettings, setLocalSotrageSettings] = useUserSettings<{
    [key: string]: string;
  }>('console.tableColumns');

  const [activeColumns] = useActiveColumns<T>({
    columnManagementID,
    columns,
    showNamespaceOverride: false,
  });

  useEffect(() => {
    if (userColumns?.[columnManagementID] && !updateOnceFromUserSetting.current) {
      setLocalSotrageSettings({
        ...localStorageSettings,
        [columnManagementID]: userColumns?.[columnManagementID],
      });
      updateOnceFromUserSetting.current = true;
    }

    if (
      !isEqualObject(
        userColumns?.[columnManagementID],
        activeColumns.map((col) => col?.id),
      )
    ) {
      setUserColumns?.({
        ...userColumns,
        [columnManagementID]: activeColumns.map((col) => col?.id),
      });
    }
  }, [
    activeColumns,
    columnManagementID,
    localStorageSettings,
    setLocalSotrageSettings,
    setUserColumns,
    userColumns,
  ]);

  return [activeColumns];
};

export default useKubevirtUserSettingsTableColumns;
