import { type Dispatch, type SetStateAction } from 'react';

import useIsACMPage from '@multicluster/useIsACMPage';
import { useUserPreference } from '@openshift-console/dynamic-plugin-sdk';
import { useSignals } from '@preact/signals-react/runtime';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import { USER_SETTINGS_KEYS } from './utils/const';
import { getUserPreferenceKey } from './utils/getUserPreferenceKey';
import { type UserSettingsState } from './utils/userSettingsInitialState';

export { getUserPreferenceKey };

export type KubevirtUserSettingResult<T> = [
  value: T,
  setValue: Dispatch<SetStateAction<T>>,
  loaded: boolean,
  error: Error,
];

/**
 * Stores a kubevirt user setting in the SDK user preferences (console `user-settings` ConfigMap
 * or local storage, owned by the current user), instead of the shared `kubevirt-user-settings`
 * ConfigMap.
 *
 * SSH keys are cluster scoped: the local cluster (Virtualization, `cluster` undefined/empty) and the
 * hub cluster (Fleet Virtualization, `cluster === hubClusterName`) share the same `kubevirt.ssh` key;
 * only managed spoke clusters use `kubevirt.ssh.<cluster>`.
 *
 * Legacy values are copied in one shot at plugin load (see `operatorNamespace`); this hook only
 * reads and updates via `useUserPreference`.
 */
const useKubevirtUserSettings = <K extends keyof UserSettingsState>(
  key: K,
  cluster?: string,
): KubevirtUserSettingResult<UserSettingsState[K]> => {
  useSignals();
  const isACMPage = useIsACMPage();
  const [hubClusterName, hubClusterLoaded] = useHubClusterName();

  // Without ACM, useHubClusterName never loads, so only wait for it on ACM pages.
  const waitingForHubClusterName =
    isACMPage && key === USER_SETTINGS_KEYS.ssh && Boolean(cluster) && !hubClusterLoaded;

  const preferenceKey = getUserPreferenceKey(key, cluster, hubClusterName);

  const [preference, setPreference, preferenceLoaded] = useUserPreference<UserSettingsState[K]>(
    preferenceKey,
    undefined,
    true,
  );

  return [
    waitingForHubClusterName ? undefined : preference,
    setPreference,
    preferenceLoaded && !waitingForHubClusterName,
    undefined,
  ];
};

export default useKubevirtUserSettings;
