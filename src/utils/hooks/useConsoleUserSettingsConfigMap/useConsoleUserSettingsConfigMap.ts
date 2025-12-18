import {
  ConfigMapModel,
  modelToGroupVersionKind,
  UserModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

const CONSOLE_USER_SETTINGS_NAMESPACE = 'openshift-console-user-settings';
const CONSOLE_USER_SETTINGS_CONFIG_MAP_PREFIX = 'user-settings-';

type UseConsoleUserSettingsConfigMap = (cluster?: string) => {
  configMapError: Error | undefined;
  configMapName: null | string;
  errorUser: Error | undefined;
  loadedConfigMap: boolean;
  loadedUser: boolean;
  userConfigMap: IoK8sApiCoreV1ConfigMap | undefined;
  userName: string | undefined;
};

/**
 * Hook to get the console user settings ConfigMap for the current user.
 * Handles fetching user info, extracting userName, and watching the user-specific ConfigMap.
 *
 * @param cluster - Optional cluster name for multicluster scenarios
 * @returns Object containing userConfigMap, loading states, errors, userName, and configMapName
 */
const useConsoleUserSettingsConfigMap: UseConsoleUserSettingsConfigMap = (cluster) => {
  const [user, loadedUser, errorUser] = useK8sWatchData<IoK8sApiCoreV1ConfigMap>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(UserModel),
    name: '~',
  });

  const userName = user?.metadata?.uid || user?.metadata?.name?.replace(/[^-._a-zA-Z0-9]+/g, '-');
  const configMapName = userName ? `${CONSOLE_USER_SETTINGS_CONFIG_MAP_PREFIX}${userName}` : null;

  const [userConfigMap, loadedConfigMap, configMapError] = useK8sWatchData<IoK8sApiCoreV1ConfigMap>(
    configMapName
      ? {
          cluster,
          groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
          name: configMapName,
          namespace: CONSOLE_USER_SETTINGS_NAMESPACE,
        }
      : null,
  );

  return {
    configMapError,
    configMapName,
    errorUser,
    loadedConfigMap: loadedConfigMap || !isEmpty(configMapError),
    loadedUser: loadedUser || !isEmpty(errorUser),
    userConfigMap: isEmpty(userConfigMap) ? undefined : userConfigMap,
    userName,
  };
};

export default useConsoleUserSettingsConfigMap;
export { CONSOLE_USER_SETTINGS_CONFIG_MAP_PREFIX, CONSOLE_USER_SETTINGS_NAMESPACE };
