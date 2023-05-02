import { useRef } from 'react';

import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { K8sResourceCommon, TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { useUserSettings } from '@openshift-console/dynamic-plugin-sdk-internal';

import useKubevirtUserSettings from './useKubevirtUserSettings';

const useKubevirtUserSettingsTableColumns = (id: string) => {
  const updateOnceFromUserSetting = useRef(null);
  const [userColumns, setUserColumns] = useKubevirtUserSettings('columns');
  const [localStorageSettings, setLocalSotrageSettings] = useUserSettings<{
    [key: string]: string;
  }>('console.tableColumns');

  const updateLayout = (activeColumns: TableColumn<K8sResourceCommon>[]) => {
    if (userColumns?.[id] && !updateOnceFromUserSetting.current) {
      setLocalSotrageSettings({
        ...localStorageSettings,
        [id]: userColumns?.[id],
      });
      updateOnceFromUserSetting.current = true;
    }

    if (
      !isEqualObject(
        userColumns?.[id],
        activeColumns.map((col) => col?.id),
      ) &&
      updateOnceFromUserSetting.current
    ) {
      setUserColumns?.({
        ...userColumns,
        [id]: activeColumns.map((col) => col?.id),
      });
    }
  };

  return updateLayout;
};

export default useKubevirtUserSettingsTableColumns;
