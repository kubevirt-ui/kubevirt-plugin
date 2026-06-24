import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  getConfigMapValue,
  isConsoleUserSettingsLocalStorage,
  upsertConsoleUserSetting,
} from '@kubevirt-utils/hooks/consoleUserSettings/utils';
import useConsoleUserSettingsConfigMap from '@kubevirt-utils/hooks/useConsoleUserSettingsConfigMap/useConsoleUserSettingsConfigMap';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { ConsoleBookmarks, ConsoleUserSettingHookResult } from '../types';
import useConsoleUserSettingLocalStorage from '../useConsoleUserSettingLocalStorage/useConsoleUserSettingLocalStorage';
import useConsoleUserSettingsCluster from '../useConsoleUserSettingsCluster/useConsoleUserSettingsCluster';
import useQueuedUserSettingWrite from '../useQueuedUserSettingWrite/useQueuedUserSettingWrite';

import { areBookmarksEqual, parseBookmarks, parseStoredBookmarks } from './utils';

type UseConsoleBookmarksResult = ConsoleUserSettingHookResult<
  ConsoleBookmarks,
  (bookmarks: ConsoleBookmarks) => Promise<ConsoleBookmarks>
>;

const useConsoleBookmarks = (key: string, cluster?: string): UseConsoleBookmarksResult => {
  const settingsCluster = useConsoleUserSettingsCluster(cluster);
  const [
    localStorageBookmarks,
    updateLocalStorageBookmarks,
    localStorageLoaded,
    localStorageError,
  ] = useConsoleUserSettingLocalStorage(key, parseStoredBookmarks, {});

  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(false);
  const [optimisticBookmarks, setOptimisticBookmarks] = useState<ConsoleBookmarks | null>(null);
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

  const bookmarksFromConfigMap = useMemo(
    () => getConfigMapValue(userConfigMap, userName, loadedConfigMap, key, parseBookmarks, {}),
    [key, loadedConfigMap, userConfigMap, userName],
  );

  const persistedBookmarks = isConsoleUserSettingsLocalStorage()
    ? localStorageBookmarks
    : bookmarksFromConfigMap;
  const persistedLoaded = isConsoleUserSettingsLocalStorage()
    ? localStorageLoaded
    : loadedConfigMap;
  const bookmarks = optimisticBookmarks ?? persistedBookmarks;

  useEffect(() => {
    if (optimisticBookmarks === null || loading) {
      return;
    }

    if (persistedLoaded && areBookmarksEqual(optimisticBookmarks, persistedBookmarks)) {
      setOptimisticBookmarks(null);
    }
  }, [loading, optimisticBookmarks, persistedBookmarks, persistedLoaded]);

  const updateConfigMapBookmarks = useCallback(
    async (newBookmarks: ConsoleBookmarks) => {
      setLoading(true);
      setError(undefined);
      setOptimisticBookmarks(newBookmarks);

      try {
        await queuedWrite(newBookmarks, async (bookmarksToWrite) => {
          const ctx = contextRef.current;
          await upsertConsoleUserSetting({
            cluster: settingsCluster,
            configMapName: ctx.configMapName,
            key,
            serializedValue: JSON.stringify(bookmarksToWrite),
            userConfigMap: ctx.userConfigMap,
            userName: ctx.userName,
          });
        });

        return newBookmarks;
      } catch (apiError) {
        const apiErr = apiError as Error;
        kubevirtConsole.error('Failed to save console bookmarks:', apiErr);
        setError(apiErr);
        setOptimisticBookmarks(null);
        throw apiErr;
      } finally {
        setLoading(false);
      }
    },
    [key, queuedWrite, settingsCluster],
  );

  const updateLocalStorageBookmarksWithOptimism = useCallback(
    async (newBookmarks: ConsoleBookmarks) => {
      setOptimisticBookmarks(newBookmarks);

      try {
        await updateLocalStorageBookmarks(newBookmarks);
        return newBookmarks;
      } catch (apiError) {
        setOptimisticBookmarks(null);
        throw apiError;
      }
    },
    [updateLocalStorageBookmarks],
  );

  const settingsLoaded = (loadedUser || !!errorUser) && (loadedConfigMap || !!configMapError);

  if (isConsoleUserSettingsLocalStorage()) {
    return [
      bookmarks,
      updateLocalStorageBookmarksWithOptimism,
      localStorageLoaded,
      localStorageError,
    ];
  }

  return [
    bookmarks,
    updateConfigMapBookmarks,
    settingsLoaded,
    error || errorUser || configMapError,
  ];
};

export default useConsoleBookmarks;
