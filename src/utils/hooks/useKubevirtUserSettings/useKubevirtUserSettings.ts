import { useCallback, useEffect, useState } from 'react';

import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import { useUserPreference } from '@openshift-console/dynamic-plugin-sdk';
import { useSignals } from '@preact/signals-react/runtime';

import { KUBEVIRT_USER_PREFERENCE_PREFIX, USER_SETTINGS_KEYS } from './utils/const';
import {
  getLegacyUserSettings,
  type LegacyUserSettings,
  markAsMigrated,
} from './utils/legacyUserSettings';
import { type UserSettingsState } from './utils/userSettingsInitialState';

export type KubevirtUserSettingResult<T> = [
  value: T,
  updater: (val: T) => Promise<T>,
  loaded: boolean,
  error: Error,
];

/**
 * Builds the SDK user preference key: `kubevirt.<key>`. SSH keys are the only cluster scoped
 * setting; for ACM spoke clusters they are stored on the hub as `kubevirt.ssh.<cluster>`.
 */
export const getUserPreferenceKey = (key: keyof UserSettingsState, cluster?: string): string =>
  cluster && key === USER_SETTINGS_KEYS.ssh
    ? `${KUBEVIRT_USER_PREFERENCE_PREFIX}.${key}.${cluster}`
    : `${KUBEVIRT_USER_PREFERENCE_PREFIX}.${key}`;

/**
 * Stores a kubevirt user setting in the SDK user preferences (console `user-settings` ConfigMap,
 * owned by the current user), instead of the shared `kubevirt-user-settings` ConfigMap.
 *
 * Existing values of the legacy ConfigMap are migrated on first load through a single cached,
 * read-only request. The legacy ConfigMap is never written to.
 */
const useKubevirtUserSettings = <K extends keyof UserSettingsState>(
  key: K,
  cluster?: string,
): KubevirtUserSettingResult<UserSettingsState[K]> => {
  useSignals();
  const operatorNamespace = operatorNamespaceSignal.value;
  const preferenceKey = getUserPreferenceKey(key, cluster);
  // Legacy entries were only ever stored for the hub cluster; spoke entries are not migrated
  const shouldMigrate = !cluster;

  const [preference, setPreference, preferenceLoaded] = useUserPreference<UserSettingsState[K]>(
    preferenceKey,
    undefined,
    true,
  );

  const [legacySettings, setLegacySettings] = useState<LegacyUserSettings>();

  useEffect(() => {
    if (!shouldMigrate || !operatorNamespace) return;

    let isMounted = true;

    void getLegacyUserSettings(operatorNamespace).then((legacy) => {
      if (isMounted) setLegacySettings(legacy);
    });

    return (): void => {
      isMounted = false;
    };
  }, [operatorNamespace, shouldMigrate]);

  const legacyLoaded = !shouldMigrate || legacySettings !== undefined;
  const legacyValue = shouldMigrate ? (legacySettings?.[key] as UserSettingsState[K]) : undefined;
  const needsMigration = preferenceLoaded && preference === undefined && legacyValue !== undefined;

  useEffect(() => {
    // never overwrite an existing preference and never migrate the same key twice
    if (!needsMigration || !markAsMigrated(preferenceKey)) return;

    setPreference(legacyValue);
  }, [needsMigration, preferenceKey, legacyValue, setPreference]);

  const updater = useCallback(
    async (val: UserSettingsState[K]): Promise<UserSettingsState[K]> => {
      setPreference(val);
      return val;
    },
    [setPreference],
  );

  const value = preference ?? legacyValue;

  return [value, updater, preferenceLoaded && legacyLoaded, undefined];
};

export default useKubevirtUserSettings;
