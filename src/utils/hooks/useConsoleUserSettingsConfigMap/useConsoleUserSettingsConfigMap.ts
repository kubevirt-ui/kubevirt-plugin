import { useMemo } from 'react';

import {
  ConfigMapModel,
  modelToGroupVersionKind,
  UserModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { isConsoleUserSettingsLocalStorage } from '@kubevirt-utils/hooks/consoleUserSettings/utils';
import { getName, getUID } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { hashUsernameForSettings } from './utils';

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
  const [user, loadedUser, errorUser] = useK8sWatchData<K8sResourceCommon>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(UserModel),
    name: '~',
  });

  const username = getName(user);
  const uid = getUID(user);

  const userSettingsId = useMemo(
    () => (loadedUser ? hashUsernameForSettings(username ?? '', uid) : null),
    [loadedUser, uid, username],
  );
  const userSettingsIdLoaded = loadedUser;

  const configMapName = userSettingsId
    ? `${CONSOLE_USER_SETTINGS_CONFIG_MAP_PREFIX}${userSettingsId}`
    : null;

  const shouldWatchConfigMap =
    !isConsoleUserSettingsLocalStorage() && userSettingsIdLoaded && !!configMapName;

  const [userConfigMap, loadedConfigMap, configMapError] = useK8sWatchData<IoK8sApiCoreV1ConfigMap>(
    shouldWatchConfigMap
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
    loadedConfigMap:
      isConsoleUserSettingsLocalStorage() ||
      ((loadedConfigMap || !isEmpty(configMapError)) && userSettingsIdLoaded),
    loadedUser: loadedUser || !isEmpty(errorUser),
    userConfigMap: isEmpty(userConfigMap) ? undefined : userConfigMap,
    userName: userSettingsId ?? undefined,
  };
};

export default useConsoleUserSettingsConfigMap;
export { CONSOLE_USER_SETTINGS_CONFIG_MAP_PREFIX, CONSOLE_USER_SETTINGS_NAMESPACE };
