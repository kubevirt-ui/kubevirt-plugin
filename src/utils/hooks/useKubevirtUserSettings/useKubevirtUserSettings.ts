import { useEffect, useState } from 'react';

import {
  ConfigMapModel,
  modelToGroupVersionKind,
  UserModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME } from './utils/const';
import { type UserSettingsState } from './utils/userSettingsInitialState';
import { parseNestedJSON, patchUserConfigMap } from './utils/utils';

export type KubevirtUserSettingResult<T> = [
  value: T,
  updater: (val: T) => Promise<T>,
  loaded: boolean,
  error: Error,
];

function useKubevirtUserSettings(): KubevirtUserSettingResult<UserSettingsState>;
function useKubevirtUserSettings<K extends keyof UserSettingsState>(
  key: K,
  cluster?: string,
): KubevirtUserSettingResult<UserSettingsState[K]>;
function useKubevirtUserSettings(
  key?: keyof UserSettingsState,
  cluster?: string,
): KubevirtUserSettingResult<UserSettingsState | UserSettingsState[keyof UserSettingsState]> {
  const [error, setError] = useState<Error>();
  const [userSettings, setUserSettings] = useState<UserSettingsState>();
  const [loading, setLoading] = useState<boolean>(false);
  const [settingsInitialized, setSettingsInitialized] = useState<boolean>(false);
  const operatorNamespace = operatorNamespaceSignal.value;

  const [user, loadedUser, errorUser] = useK8sWatchData<IoK8sApiCoreV1ConfigMap>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(UserModel),
    name: '~',
  });

  const userName = user?.metadata?.uid ?? user?.metadata?.name?.replace(/[^-._a-zA-Z0-9]+/g, '-');

  const [userConfigMap, loadedConfigMap, configMapError] = useK8sWatchData<IoK8sApiCoreV1ConfigMap>(
    operatorNamespace &&
      userName && {
        cluster,
        groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
        name: KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME,
        namespace: operatorNamespace,
      },
  );

  const loadedCM = (loadedConfigMap || !isEmpty(configMapError)) && !isEmpty(operatorNamespace);
  const loadedUsr = loadedUser || !isEmpty(errorUser);

  useEffect(() => {
    if (!loadedCM || !loadedUsr) return;

    if (!isEmpty(userConfigMap) && userName) {
      setUserSettings(
        (<unknown>parseNestedJSON(userConfigMap?.data?.[userName]) || {}) as UserSettingsState,
      );
    }

    setSettingsInitialized(true);
  }, [userConfigMap, userName, loadedCM, loadedUsr]);

  const pushUserSettingsChanges = async (
    data: UserSettingsState,
    resolve: (value: unknown) => void,
    reject: (reason: unknown) => void,
  ): Promise<void> => {
    setLoading(true);

    try {
      await patchUserConfigMap(userConfigMap, userName, data, cluster);
      resolve(key ? data[key] : data);
    } catch (apiError) {
      setError(apiError as Error);
      reject(apiError);
    }

    setLoading(false);
  };

  const updateUserSetting = (
    val: UserSettingsState | UserSettingsState[keyof UserSettingsState],
  ): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      setUserSettings((prevUserSettings) => {
        const data = (key ? { ...prevUserSettings, [key]: val } : val) as UserSettingsState;

        void pushUserSettingsChanges(data, resolve, reject);

        return data;
      });
    });
  };

  return [
    key ? userSettings?.[key] : userSettings,
    userSettings && updateUserSetting,
    !loading && settingsInitialized,
    error ?? errorUser ?? configMapError,
  ] as KubevirtUserSettingResult<UserSettingsState | UserSettingsState[keyof UserSettingsState]>;
}

export default useKubevirtUserSettings;
