import { useEffect, useState } from 'react';

import {
  ConfigMapModel,
  modelToGroupVersionKind,
  RoleBindingModel,
  RoleModel,
  UserModel,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiRbacV1Role,
  IoK8sApiRbacV1RoleBinding,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { OPENSHIFT_CNV } from '@kubevirt-utils/constants/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import {
  KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME,
  userSettingsRole,
  userSettingsRoleBinding,
} from './utils/const';
import { UseKubevirtUserSettings } from './utils/types';
import userSettingsInitialState, { UserSettingsState } from './utils/userSettingsInitialState';
import { parseNestedJSON, patchUserConfigMap } from './utils/utils';

const useKubevirtUserSettings: UseKubevirtUserSettings = (key) => {
  const [error, setError] = useState<Error>();
  const [userSettings, setUserSettings] = useState<UserSettingsState>();
  const [loading, setLoading] = useState<boolean>(true);

  const [user, loadedUser, errorUser] = useK8sWatchResource<IoK8sApiCoreV1ConfigMap>({
    groupVersionKind: modelToGroupVersionKind(UserModel),
    name: '~',
  });

  const userName = user?.metadata?.uid || user?.metadata?.name?.replace(/[^-._a-zA-Z0-9]+/g, '-');

  const [userConfigMap, loadedConfigMap, configMapError] =
    useK8sWatchResource<IoK8sApiCoreV1ConfigMap>(
      userName && {
        groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
        name: KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME,
        namespace: OPENSHIFT_CNV,
      },
    );

  useEffect(() => {
    if (userName) {
      if (configMapError?.code === 404) {
        const createResources = async () => {
          await k8sCreate<IoK8sApiCoreV1ConfigMap>({
            data: {
              data: { [userName]: JSON.stringify(userSettingsInitialState) },
              metadata: {
                name: KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME,
                namespace: OPENSHIFT_CNV,
              },
            },
            model: ConfigMapModel,
          });

          await k8sCreate<IoK8sApiRbacV1Role>({
            data: userSettingsRole,
            model: RoleModel,
          });

          await k8sCreate<IoK8sApiRbacV1RoleBinding>({
            data: userSettingsRoleBinding,
            model: RoleBindingModel,
          });
        };

        try {
          createResources();
          setError(null);
        } catch (e) {
          setError(e);
        }
      }
      loadedConfigMap && setLoading(false);
    }
  }, [configMapError?.code, userName, loadedConfigMap]);

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
      await patchUserConfigMap(userConfigMap, userName, data);
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
    !loading && loadedUser && loadedConfigMap,
    error || errorUser || configMapError,
  ];
};

export default useKubevirtUserSettings;
