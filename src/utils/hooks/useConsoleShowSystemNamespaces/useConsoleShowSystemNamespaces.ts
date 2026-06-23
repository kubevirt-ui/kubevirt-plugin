import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { UseConsoleShowSystemNamespaces } from '@kubevirt-utils/hooks/consoleUserSettings/types';
import useConsoleUserSettingLocalStorage from '@kubevirt-utils/hooks/consoleUserSettings/useConsoleUserSettingLocalStorage/useConsoleUserSettingLocalStorage';
import {
  parseBooleanUserPreference,
  parseStoredBooleanUserPreference,
  serializeBooleanUserPreference,
} from '@kubevirt-utils/hooks/consoleUserSettings/useConsoleUserSettingLocalStorage/utils';
import useConsoleUserSettingsCluster from '@kubevirt-utils/hooks/consoleUserSettings/useConsoleUserSettingsCluster/useConsoleUserSettingsCluster';
import useQueuedUserSettingWrite from '@kubevirt-utils/hooks/consoleUserSettings/useQueuedUserSettingWrite/useQueuedUserSettingWrite';
import {
  getConfigMapValue,
  isConsoleUserSettingsLocalStorage,
  upsertConsoleUserSetting,
} from '@kubevirt-utils/hooks/consoleUserSettings/utils';
import useConsoleUserSettingsConfigMap from '@kubevirt-utils/hooks/useConsoleUserSettingsConfigMap/useConsoleUserSettingsConfigMap';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { CONSOLE_NAMESPACE_SYSTEM_NAMESPACE_KEY } from './consts';

const useConsoleShowSystemNamespaces: UseConsoleShowSystemNamespaces = (cluster) => {
  const settingsCluster = useConsoleUserSettingsCluster(cluster);
  const [localStorageValue, updateLocalStorageValue, localStorageLoaded, localStorageError] =
    useConsoleUserSettingLocalStorage(
      CONSOLE_NAMESPACE_SYSTEM_NAMESPACE_KEY,
      parseStoredBooleanUserPreference,
      false,
    );

  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(false);
  const [optimisticValue, setOptimisticValue] = useState<boolean | null>(null);
  const queuedWrite = useQueuedUserSettingWrite();

  const {
    configMapError,
    configMapName,
    errorUser,
    loadedConfigMap,
    loadedUser,
    userConfigMap,
    userName,
  } = useConsoleUserSettingsConfigMap(settingsCluster);

  const contextRef = useRef({ configMapName, userConfigMap, userName });
  contextRef.current = { configMapName, userConfigMap, userName };

  const valueFromConfigMap = useMemo(
    () =>
      getConfigMapValue(
        userConfigMap,
        userName,
        loadedConfigMap,
        CONSOLE_NAMESPACE_SYSTEM_NAMESPACE_KEY,
        parseBooleanUserPreference,
        false,
      ),
    [loadedConfigMap, userConfigMap, userName],
  );

  const persistedValue = isConsoleUserSettingsLocalStorage()
    ? localStorageValue
    : valueFromConfigMap;
  const persistedLoaded = isConsoleUserSettingsLocalStorage()
    ? localStorageLoaded
    : loadedConfigMap;
  const showSystemNamespaces = optimisticValue ?? persistedValue;

  useEffect(() => {
    if (optimisticValue === null || loading) {
      return;
    }

    if (persistedLoaded && persistedValue === optimisticValue) {
      setOptimisticValue(null);
    }
  }, [loading, optimisticValue, persistedLoaded, persistedValue]);

  const updateConfigMapValue = useCallback(
    async (showSystem: boolean) => {
      setError(undefined);
      setOptimisticValue(showSystem);
      setLoading(true);

      try {
        await queuedWrite(showSystem, async (valueToWrite) => {
          const ctx = contextRef.current;
          await upsertConsoleUserSetting({
            cluster: settingsCluster,
            configMapName: ctx.configMapName,
            key: CONSOLE_NAMESPACE_SYSTEM_NAMESPACE_KEY,
            serializedValue: serializeBooleanUserPreference(valueToWrite),
            userConfigMap: ctx.userConfigMap,
            userName: ctx.userName,
          });
        });

        return showSystem;
      } catch (apiError) {
        const apiErr = apiError as Error;
        kubevirtConsole.error('Failed to save show system namespaces preference:', apiErr);
        setError(apiErr);
        setOptimisticValue(null);
        throw apiErr;
      } finally {
        setLoading(false);
      }
    },
    [queuedWrite, settingsCluster],
  );

  const updateLocalStorageValueWithOptimism = useCallback(
    async (showSystem: boolean) => {
      setOptimisticValue(showSystem);

      try {
        await updateLocalStorageValue(showSystem);
        return showSystem;
      } catch (apiError) {
        setOptimisticValue(null);
        throw apiError;
      }
    },
    [updateLocalStorageValue],
  );

  const settingsLoaded = (loadedUser || !!errorUser) && (loadedConfigMap || !!configMapError);

  if (isConsoleUserSettingsLocalStorage()) {
    return [
      showSystemNamespaces,
      updateLocalStorageValueWithOptimism,
      localStorageLoaded,
      localStorageError,
    ];
  }

  return [
    showSystemNamespaces,
    updateConfigMapValue,
    settingsLoaded,
    error || errorUser || configMapError,
  ];
};

export default useConsoleShowSystemNamespaces;
