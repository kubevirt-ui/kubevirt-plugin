import { useEffect, useState } from 'react';

import {
  ConfigMapModel,
  modelToGroupVersionKind,
  UserModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { DEFAULT_NAMESPACE, OPENSHIFT_CNV } from '@kubevirt-utils/constants/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME } from './utils/const';
import { UseKubevirtUserSettings } from './utils/types';
import { UserSettingsState } from './utils/userSettingsInitialState';
import {
  createEmptyUserSettings,
  moveUserSettingsToOpenshiftCNV,
  parseNestedJSON,
  patchUserConfigMap,
} from './utils/utils';

const useKubevirtUserSettings: UseKubevirtUserSettings = (key) => {
  const [error, setError] = useState<Error>();
  const [userSettings, setUserSettings] = useState<UserSettingsState>();
  const [loading, setLoading] = useState<boolean>(true);

  const [user, loadedUser, errorUser] = useK8sWatchResource<IoK8sApiCoreV1ConfigMap>({
    groupVersionKind: modelToGroupVersionKind(UserModel),
    name: '~',
  });

  const userName = user?.metadata?.uid || user?.metadata?.name?.replace(/[^-._a-zA-Z0-9]+/g, '-');

  const [userConfigMapDefault, , errorConfigMapDefault] =
    useK8sWatchResource<IoK8sApiCoreV1ConfigMap>(
      userName && {
        groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
        name: KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME,
        namespace: DEFAULT_NAMESPACE,
      },
    );

  const [userConfigMapOpenshiftCNV, loadedConfigMapOpenshiftCNV, errorConfigMapOpenshiftCNV] =
    useK8sWatchResource<IoK8sApiCoreV1ConfigMap>(
      userName && {
        groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
        name: KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME,
        namespace: OPENSHIFT_CNV,
      },
    );

  useEffect(() => {
    if (userName) {
      if (errorConfigMapOpenshiftCNV?.code === 404) {
        if (!isEmpty(userConfigMapDefault)) {
          try {
            moveUserSettingsToOpenshiftCNV(userConfigMapDefault);
            setError(null);
          } catch (e) {
            setError(e);
          }
        }

        if (errorConfigMapDefault?.code === 404) {
          try {
            createEmptyUserSettings(userName);
            setError(null);
          } catch (e) {
            setError(e);
          }
        }
      }

      loadedConfigMapOpenshiftCNV && setLoading(false);
    }
  }, [
    errorConfigMapDefault?.code,
    userName,
    loadedConfigMapOpenshiftCNV,
    errorConfigMapOpenshiftCNV?.code,
  ]);

  useEffect(() => {
    if (!isEmpty(userConfigMapOpenshiftCNV) && userName) {
      setUserSettings(
        (<unknown>parseNestedJSON(userConfigMapOpenshiftCNV?.data?.[userName]) ||
          {}) as UserSettingsState,
      );
    }
  }, [userConfigMapOpenshiftCNV, userName]);

  const pushUserSettingsChanges = async (data, resolve, reject) => {
    setLoading(true);

    try {
      await patchUserConfigMap(userConfigMapOpenshiftCNV, userName, data);
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
    !loading && loadedUser && loadedConfigMapOpenshiftCNV,
    error || errorUser || errorConfigMapDefault,
  ];
};

export default useKubevirtUserSettings;
