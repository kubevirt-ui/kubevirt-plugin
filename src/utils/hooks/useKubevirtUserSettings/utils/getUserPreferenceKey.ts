import { KUBEVIRT_USER_PREFERENCE_PREFIX, USER_SETTINGS_KEYS } from './const';
import { type UserSettingsState } from './userSettingsInitialState';

/**
 * True when `cluster` targets a managed (spoke) cluster rather than the local / hub cluster.
 * The local cluster in Virtualization (`cluster` undefined or empty) and the hub cluster in Fleet
 * Virtualization (`cluster === hubClusterName`) are the same cluster.
 */
export const isSpokeClusterPreference = (cluster?: string, hubClusterName?: string): boolean =>
  Boolean(cluster) && cluster !== hubClusterName;

/**
 * Builds the SDK user preference key: `kubevirt.<key>`. SSH keys are the only cluster scoped
 * setting: managed (spoke) clusters are stored on the hub as `kubevirt.ssh.<cluster>`, while the
 * local cluster (Virtualization) and the hub cluster (Fleet Virtualization) share `kubevirt.ssh`.
 */
export const getUserPreferenceKey = (
  key: keyof UserSettingsState,
  cluster?: string,
  hubClusterName?: string,
): string =>
  key === USER_SETTINGS_KEYS.ssh && isSpokeClusterPreference(cluster, hubClusterName)
    ? `${KUBEVIRT_USER_PREFERENCE_PREFIX}.${key}.${cluster}`
    : `${KUBEVIRT_USER_PREFERENCE_PREFIX}.${key}`;
