import { type Dispatch, type SetStateAction } from 'react';

import { useUserPreference } from '@openshift-console/dynamic-plugin-sdk';
import { useSignals } from '@preact/signals-react/runtime';

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
 * Legacy values are copied in one shot at plugin load (see `operatorNamespace`); this hook only
 * reads and updates via `useUserPreference`.
 */
const useKubevirtUserSettings = <K extends keyof UserSettingsState>(
  key: K,
  cluster?: string,
): KubevirtUserSettingResult<UserSettingsState[K]> => {
  useSignals();
  const preferenceKey = getUserPreferenceKey(key, cluster);

  const [preference, setPreference, preferenceLoaded] = useUserPreference<UserSettingsState[K]>(
    preferenceKey,
    undefined,
    true,
  );

  return [preference, setPreference, preferenceLoaded, undefined];
};

export default useKubevirtUserSettings;
