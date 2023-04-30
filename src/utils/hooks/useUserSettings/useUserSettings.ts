import { useEffect, useMemo, useState } from 'react';

import {
  ConfigMapModel,
  UserModel,
  modelToGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  k8sCreate,
  k8sGet,
  k8sPatch,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';

type UseUserSettings = (
  key?: string,
) => [{ [key: string]: any }, (val: any) => void, boolean, Error];

const useUserSettings: UseUserSettings = (key) => {
  const [error, setError] = useState<Error>();
  const [userName, setUserName] = useState<string>();
  const [userSettings, setUserSettings] = useState<{ [key: string]: any }>();
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
          },
        });
      } catch (e) {
        setError(e);
      }
      setLoading(false);
    }
  }, [configMapError?.code, userName]);

  useEffect(() => {
    if (!isEmpty(userConfigMap) && !userSettings) {
      setUserSettings(userConfigMap?.data || {});
    }
  }, [userConfigMap, userSettings]);

  const updateUserSetting = (val: any) => {
    setUserSettings((prevUserSettings) => {
      const data = key ? { ...prevUserSettings, [key]: val } : val;
      updateResource(data);
      return data;
    });
    setLoading(true);
    const updateResource = (data: { [key: string]: any }) => {
      try {
        k8sPatch({
          model: ConfigMapModel,
          resource: userConfigMap,
          data: [
            {
              op: 'replace',
              path: '/data',
              value: data,
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

export default useUserSettings;
