import { ConfigMapModel, UserModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sGet, type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME } from './const';
import { type UserSettingsState } from './userSettingsInitialState';
import { parseNestedJSON } from './utils';

export type LegacyUserSettings = Partial<UserSettingsState>;

const legacySettingsByNamespace = new Map<string, Promise<LegacyUserSettings>>();

const isPlainObject = (value: unknown): value is LegacyUserSettings =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const fetchLegacyUserSettings = async (namespace: string): Promise<LegacyUserSettings> => {
  try {
    const user = await k8sGet<K8sResourceCommon>({ model: UserModel, name: '~' });
    const userName = user?.metadata?.uid ?? user?.metadata?.name?.replace(/[^-._a-zA-Z0-9]+/g, '-');

    if (!userName) return {};

    const configMap = await k8sGet<IoK8sApiCoreV1ConfigMap>({
      model: ConfigMapModel,
      name: KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME,
      ns: namespace,
    });

    const raw = configMap?.data?.[userName];
    if (isEmpty(raw)) return {};

    const parsed = parseNestedJSON<unknown>(raw);

    return isPlainObject(parsed) ? parsed : {};
  } catch {
    // 403 / 404 / network errors: there is nothing to migrate
    return {};
  }
};

/**
 * Reads (GET only, never writes) the current user's entry of the legacy shared
 * `kubevirt-user-settings` ConfigMap. The request is issued at most once per namespace and
 * the result is shared by every hook instance. It never rejects: any failure resolves to `{}`.
 */
export const getLegacyUserSettings = (namespace: string): Promise<LegacyUserSettings> => {
  if (!legacySettingsByNamespace.has(namespace)) {
    legacySettingsByNamespace.set(namespace, fetchLegacyUserSettings(namespace));
  }

  return legacySettingsByNamespace.get(namespace);
};

/** Preference keys already migrated (or in the process of being migrated) in this session. */
const migratedPreferenceKeys = new Set<string>();

export const markAsMigrated = (preferenceKey: string): boolean => {
  if (migratedPreferenceKeys.has(preferenceKey)) return false;

  migratedPreferenceKeys.add(preferenceKey);
  return true;
};

export const resetLegacyUserSettingsCache = (): void => {
  legacySettingsByNamespace.clear();
  migratedPreferenceKeys.clear();
};
