import { useEffect, useState } from 'react';

import { ConfigMapModel, UserModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { DEFAULT_OPERATOR_NAMESPACE, isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';

import { KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME } from './utils/const';
import { UseKubevirtUserSettings } from './utils/types';
import { UserSettingsState } from './utils/userSettingsInitialState';
import { parseNestedJSON, patchUserConfigMap } from './utils/utils';

const useKubevirtUserSettings: UseKubevirtUserSettings = (key) => {
  const [error, setError] = useState<Error>();
  const [userSettings, setUserSettings] = useState<UserSettingsState>();
  const [loading, setLoading] = useState<boolean>(false);

  const [userName, setUserName] = useState<string>();
  const [loadedUser, setLoadedUser] = useState<boolean>(false);
  const [errorUser, setErrorUser] = useState<Error>();

  const [userConfigMap, setUserConfigMap] = useState<IoK8sApiCoreV1ConfigMap>();
  const [loadedConfigMap, setLoadedConfigMap] = useState<boolean>(false);
  const [configMapError, setConfigMapError] = useState<Error>();

  // Regular users only have `get` (no `watch`/`list`) here, so fetch once instead of watching.
  useEffect(() => {
    let isMounted = true;

    k8sGet({ model: UserModel, name: '~' })
      .then((user) => {
        if (!isMounted) return;
        setUserName(user?.metadata?.uid || user?.metadata?.name?.replace(/[^-._a-zA-Z0-9]+/g, '-'));
        setLoadedUser(true);
      })
      .catch((getUserError) => {
        if (!isMounted) return;
        setErrorUser(getUserError);
        setLoadedUser(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!userName) return;

    let isMounted = true;

    k8sGet<IoK8sApiCoreV1ConfigMap>({
      model: ConfigMapModel,
      name: KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME,
      ns: DEFAULT_OPERATOR_NAMESPACE,
    })
      .then((configMap) => {
        if (!isMounted) return;
        setUserConfigMap(configMap);
        setLoadedConfigMap(true);
      })
      .catch((getConfigMapError) => {
        if (!isMounted) return;
        setConfigMapError(getConfigMapError);
        setLoadedConfigMap(true);
      });

    return () => {
      isMounted = false;
    };
  }, [userName]);

  useEffect(() => {
    if (!isEmpty(userConfigMap) && userName) {
      setUserSettings(
        (<unknown>parseNestedJSON(userConfigMap?.data?.[userName]) || {}) as UserSettingsState,
      );
    }
  }, [userConfigMap, userName]);

  const pushUserSettingsChanges = async (data, resolve, reject) => {
    setLoading(true);

    try {
      const updatedConfigMap = await patchUserConfigMap(userConfigMap, userName, data);
      setUserConfigMap(updatedConfigMap);
      resolve(key ? data[key] : data);
    } catch (apiError) {
      setError(apiError);
      reject(apiError);
    }

    setLoading(false);
  };

  // Kept out of a setUserSettings updater: updaters must stay pure and can run more than once.
  const updateUserSetting = (val: any) => {
    const data = key ? { ...userSettings, [key]: val } : val;

    return new Promise((resolve, reject) => {
      setUserSettings(data);
      pushUserSettingsChanges(data, resolve, reject);
    });
  };

  const loadedUsr = loadedUser || !isEmpty(errorUser);
  // No userName means the configmap fetch never runs, so there's nothing left to wait for.
  const loadedCM = loadedConfigMap || !isEmpty(configMapError) || (loadedUsr && !userName);

  return [
    key ? userSettings?.[key] : userSettings,
    userSettings && updateUserSetting,
    !loading && loadedUsr && loadedCM,
    error || errorUser || configMapError,
  ];
};

export default useKubevirtUserSettings;
