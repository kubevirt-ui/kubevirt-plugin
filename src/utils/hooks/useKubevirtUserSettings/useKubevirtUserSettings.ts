import { useEffect, useMemo, useState } from 'react';

import {
  ConfigMapModel,
  modelToGroupVersionKind,
  UserModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  k8sCreate,
  k8sGet,
  k8sPatch,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

import userSettingsInitialState, { UserSettingsState } from './utils/userSettingsInitialState';
import { parseNestedJSON } from './utils/utils';

type UseKubevirtUserSettings = (
  key?: string,
) => [{ [key: string]: any }, (val: any) => void, boolean, Error];

const useKubevirtUserSettings: UseKubevirtUserSettings = (key) => {
  const [error, setError] = useState<Error>();
  const [userName, setUserName] = useState<string>();
  const [userSettings, setUserSettings] = useState<UserSettingsState>();
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingUserName, setLoadingUserName] = useState<boolean>(true);
  const userConfigMapName = useMemo(() => `${userName}-kubevirt-settings`, [userName]);

  useEffect(() => {
    const fetchUserName = async () => {
      setError(null);
      try {
        const user = await k8sGet({ model: UserModel, path: '~' });
        setUserName(user?.metadata?.name?.replace(':', '-'));
      } catch (e) {
        setError(e);
      }
      setLoadingUserName(false);
    };
    fetchUserName();
  }, []);

  const [userConfigMap, loadedConfigMap, configMapError] =
    useK8sWatchResource<IoK8sApiCoreV1ConfigMap>(
      userName && {
        groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
        name: userConfigMapName,
        namespace: DEFAULT_NAMESPACE,
      },
    );

  useEffect(() => {
    if (userName) {
      if (configMapError?.code === 404) {
        try {
          k8sCreate({
            data: {
              data: { settings: JSON.stringify(userSettingsInitialState) },
              metadata: {
                name: userConfigMapName,
                namespace: DEFAULT_NAMESPACE,
              },
            },
            model: ConfigMapModel,
          });
        } catch (e) {
          setError(e);
        }
      }
      loadedConfigMap && setLoading(false);
    }
  }, [configMapError?.code, userName, userConfigMapName, loadedConfigMap]);

  useEffect(() => {
    if (!isEmpty(userConfigMap) && !userSettings) {
      setUserSettings(
        (<unknown>parseNestedJSON(userConfigMap?.data?.settings) || {}) as UserSettingsState,
      );
    }
  }, [userConfigMap, userSettings]);

  const updateUserSetting = (val: any) => {
    setUserSettings((prevUserSettings) => {
      const data = key ? { ...prevUserSettings, [key]: val } : val;
      updateResource(data);
      return data;
    });
    const updateResource = async (data: { [key: string]: any }) => {
      try {
        await k8sPatch({
          data: [
            {
              op: 'replace',
              path: '/data',
              value: { settings: JSON.stringify(data) },
            },
          ],
          model: ConfigMapModel,
          resource: userConfigMap,
        });
      } catch (e) {
        setError(e);
      }
    };
  };

  return [
    key ? userSettings?.[key] : userSettings,
    userSettings && updateUserSetting,
    !loading && !loadingUserName && loadedConfigMap,
    error || configMapError,
  ];
};

export default useKubevirtUserSettings;
