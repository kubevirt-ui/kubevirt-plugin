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

type UseKubevirtUserSettings = (
  key?: string,
) => [{ [key: string]: any }, (val: any) => void, boolean, Error];

const useKubevirtUserSettings: UseKubevirtUserSettings = (key) => {
  const [error, setError] = useState<Error>();
  const [userName, setUserName] = useState<string>();
  const [userSettings, setUserSettings] = useState<UserSettingsState>();
  const [loading, setLoading] = useState<boolean>(false);
  const userConfigMapName = useMemo(() => `${userName}-kubevirt-settings`, [userName]);

  useEffect(() => {
    const fetchUserName = async () => {
      setError(null);
      setLoading(true);
      try {
        const user = await k8sGet({ model: UserModel, path: '~' });
        setUserName(user?.metadata?.name?.replace(':', '-'));
      } catch (e) {
        setError(e);
      }
      setLoading(false);
    };
    fetchUserName();
  }, []);

  const [userConfigMap, loadedConfigMap, configMapError] =
    useK8sWatchResource<IoK8sApiCoreV1ConfigMap>(
      userName && {
        groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
        namespace: DEFAULT_NAMESPACE,
        name: userConfigMapName,
      },
    );

  useEffect(() => {
    if (configMapError?.code === 404 && userName) {
      setLoading(true);
      try {
        k8sCreate({
          model: ConfigMapModel,
          data: {
            metadata: {
              name: userConfigMapName,
              namespace: DEFAULT_NAMESPACE,
            },
            data: { settings: JSON.stringify(userSettingsInitialState) },
          },
        });
      } catch (e) {
        setError(e);
      }
      setLoading(false);
    }
  }, [configMapError?.code, userName, userConfigMapName]);

  useEffect(() => {
    if (!isEmpty(userConfigMap) && !userSettings) {
      setUserSettings(
        (<unknown>JSON.parse(userConfigMap?.data?.settings) || {}) as UserSettingsState,
      );
    }
  }, [userConfigMap, userSettings]);

  const updateUserSetting = (val: any) => {
    setUserSettings((prevUserSettings) => {
      const data = key ? { ...prevUserSettings, [key]: val } : val;
      updateResource(data);
      return data;
    });
    setLoading(true);
    const updateResource = async (data: { [key: string]: any }) => {
      try {
        await k8sPatch({
          model: ConfigMapModel,
          resource: userConfigMap,
          data: [
            {
              op: 'replace',
              path: '/data',
              value: { settings: JSON.stringify(data) },
            },
          ],
        });
      } catch (e) {
        setError(e);
      }
      setLoading(false);
    };
  };

  return [
    key ? userSettings?.[key] : userSettings,
    userSettings && updateUserSetting,
    loading || loadedConfigMap,
    error || configMapError,
  ];
};

export default useKubevirtUserSettings;
