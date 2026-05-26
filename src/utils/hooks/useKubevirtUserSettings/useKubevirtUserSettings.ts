import { useEffect, useState } from 'react';
import {
  ConfigMapModel,
  modelToGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME } from './utils/const';
import { UseKubevirtUserSettings } from './utils/types';
import { UserSettingsState } from './utils/userSettingsInitialState';
import { parseNestedJSON, patchUserConfigMap } from './utils/utils';

const alwaysUseLocalStorage = (window as Window & {
  SERVER_FLAGS?: { userSettingsLocation?: 'configmap' | 'localstorage' };
}).SERVER_FLAGS?.userSettingsLocation === 'localstorage';

const getIsImpersonating = (): boolean => !!localStorage.getItem('impersonate-user');

const getUserUid = (): string | null => {
  const rawUserID = localStorage.getItem('userID');
  if (rawUserID) {
    try {
      const decoded = atob(rawUserID);
      if (decoded) return decoded;
    } catch {
      return rawUserID;
    }
  }
  return null;
};

const getLsKey = (): string | null => {
  const userUid = getUserUid();
  const isImpersonating = getIsImpersonating();

  if (!userUid) {
    return null;
  }

  return alwaysUseLocalStorage && !isImpersonating
    ? 'kubevirt-user-settings'
    : `kubevirt-user-settings-${userUid}`;
};

const useKubevirtUserSettings: UseKubevirtUserSettings = (key, cluster) => {
  const [error, setError] = useState<Error>();
  const [userSettings, setUserSettings] = useState<UserSettingsState>();
  const [loading, setLoading] = useState<boolean>(false);
  const [settingsInitialized, setSettingsInitialized] = useState<boolean>(false);
  const operatorNamespace = operatorNamespaceSignal.value;

  const lsKey = getLsKey();
  const isLocalStorage = alwaysUseLocalStorage || getIsImpersonating();

  const [userConfigMap, loadedConfigMap, configMapError] = useK8sWatchData<IoK8sApiCoreV1ConfigMap>(
    !isLocalStorage && operatorNamespace && lsKey
      ? {
          cluster,
          groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
          name: KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME,
          namespace: operatorNamespace,
        }
      : null,
  );

  const loadedCM = (loadedConfigMap || !isEmpty(configMapError)) && !isEmpty(operatorNamespace);
  const loadedUsr = true;

  const lsData = isLocalStorage
    ? (() => {
        try {
          const raw = lsKey ? localStorage.getItem(lsKey) : null;
          return raw ? JSON.parse(raw) : {};
        } catch {
          return {};
        }
      })()
    : null;

  useEffect(() => {
    if (isLocalStorage) {
      setUserSettings(lsData as UserSettingsState);
      setSettingsInitialized(true);
      return;
    }

    if (!loadedCM || !loadedUsr) return;

    if (!isEmpty(userConfigMap) && lsKey) {
      setUserSettings(
        (<unknown>parseNestedJSON(userConfigMap?.data?.[lsKey]) || {}) as UserSettingsState,
      );
    }

    setSettingsInitialized(true);
  }, [userConfigMap, lsKey, loadedCM, loadedUsr, lsData]);

  const pushUserSettingsChanges = async (data, resolve, reject) => {
    setLoading(true);

    try {
      if (isLocalStorage) {
        if (lsKey) {
          localStorage.setItem(lsKey, JSON.stringify(data));
        }
      } else {
        await patchUserConfigMap(userConfigMap, lsKey, data, cluster);
      }
      resolve(key ? data[key] : data);
    } catch (apiError) {
      setError(apiError);
      reject(apiError);
    }

    setLoading(false);
  };

  const updateUserSetting = (val: any) => {
    return new Promise((resolve, reject) => {
      setUserSettings((prevUserSettings) => {
        const data = key ? { ...prevUserSettings, [key]: val } : val;

        pushUserSettingsChanges(data, resolve, reject);

        return data;
      });
    });
  };

  return [
    key ? userSettings?.[key] : userSettings,
    userSettings && updateUserSetting,
    !loading && settingsInitialized,
    error || (!isLocalStorage ? configMapError : undefined),
  ];
};

export default useKubevirtUserSettings;