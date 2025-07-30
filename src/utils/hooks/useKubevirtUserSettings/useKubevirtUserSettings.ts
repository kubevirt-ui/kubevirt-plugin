import { useEffect, useState } from 'react';

import {
  ConfigMapModel,
  modelToGroupVersionKind,
  UserModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { DEFAULT_OPERATOR_NAMESPACE, isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME } from './utils/const';
import { UseKubevirtUserSettings } from './utils/types';
import { UserSettingsState } from './utils/userSettingsInitialState';
import { parseNestedJSON, patchUserConfigMap } from './utils/utils';

const useKubevirtUserSettings: UseKubevirtUserSettings = (key, cluster) => {
  const [error, setError] = useState<Error>();
  const [userSettings, setUserSettings] = useState<UserSettingsState>();
  const [loading, setLoading] = useState<boolean>(false);

  const [user, loadedUser, errorUser] = useK8sWatchData<IoK8sApiCoreV1ConfigMap>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(UserModel),
    name: '~',
  });

  const userName = user?.metadata?.uid || user?.metadata?.name?.replace(/[^-._a-zA-Z0-9]+/g, '-');

  const [userConfigMap, loadedConfigMap, configMapError] = useK8sWatchData<IoK8sApiCoreV1ConfigMap>(
    userName && {
      cluster,
      groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
      name: KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME,
      namespace: DEFAULT_OPERATOR_NAMESPACE,
    },
  );

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
      await patchUserConfigMap(userConfigMap, userName, data, cluster);
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

  const loadedCM = loadedConfigMap || !isEmpty(configMapError);
  const loadedUsr = loadedUser || !isEmpty(errorUser);

  return [
    key ? userSettings?.[key] : userSettings,
    userSettings && updateUserSetting,
    !loading && loadedUsr && loadedCM,
    error || errorUser || configMapError,
  ];
};

export default useKubevirtUserSettings;
