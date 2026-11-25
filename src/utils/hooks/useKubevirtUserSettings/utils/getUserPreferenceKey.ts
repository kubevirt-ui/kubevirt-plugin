import { KUBEVIRT_USER_PREFERENCE_PREFIX, USER_SETTINGS_KEYS } from './const';
import { type UserSettingsState } from './userSettingsInitialState';

/**
 * Builds the SDK user preference key: `kubevirt.<key>`. SSH keys are the only cluster scoped
 * setting; for ACM spoke clusters they are stored on the hub as `kubevirt.ssh.<cluster>`.
 */
export const getUserPreferenceKey = (key: keyof UserSettingsState, cluster?: string): string =>
  cluster && key === USER_SETTINGS_KEYS.ssh
    ? `${KUBEVIRT_USER_PREFERENCE_PREFIX}.${key}.${cluster}`
    : `${KUBEVIRT_USER_PREFERENCE_PREFIX}.${key}`;
