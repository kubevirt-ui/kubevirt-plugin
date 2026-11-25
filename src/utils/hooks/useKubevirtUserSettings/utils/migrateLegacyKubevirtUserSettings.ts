import { ConfigMapModel, UserModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  readConsoleUserSettingsLocalStorage,
  writeConsoleUserSettingsLocalStorage,
} from '@kubevirt-utils/hooks/consoleUserSettings/useConsoleUserSettingLocalStorage/utils';
import { isConsoleUserSettingsLocalStorage } from '@kubevirt-utils/hooks/consoleUserSettings/utils';
import {
  CONSOLE_USER_SETTINGS_CONFIG_MAP_PREFIX,
  CONSOLE_USER_SETTINGS_NAMESPACE,
} from '@kubevirt-utils/hooks/useConsoleUserSettingsConfigMap/useConsoleUserSettingsConfigMap';
import { hashUsernameForSettings } from '@kubevirt-utils/hooks/useConsoleUserSettingsConfigMap/utils';
import { getName, getUID } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  k8sCreate,
  k8sGet,
  k8sPatch,
  type K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';

import { USER_SETTINGS_KEYS } from './const';
import { getUserPreferenceKey } from './getUserPreferenceKey';
import { getLegacyUserSettings, type LegacyUserSettings } from './legacyUserSettings';
import { type UserSettingsState } from './userSettingsInitialState';

let migrationPromise: Promise<void> | undefined;

const legacySettingsToPreferenceEntries = (legacy: LegacyUserSettings): Record<string, string> => {
  const entries: Record<string, string> = {};

  for (const settingKey of Object.values(USER_SETTINGS_KEYS) as (keyof UserSettingsState)[]) {
    const value = legacy[settingKey];
    if (value === undefined) continue;

    entries[getUserPreferenceKey(settingKey)] = JSON.stringify(value);
  }

  return entries;
};

const legacySettingsToLocalStorageEntries = (
  legacy: LegacyUserSettings,
): Record<string, unknown> => {
  const entries: Record<string, unknown> = {};

  for (const settingKey of Object.values(USER_SETTINGS_KEYS) as (keyof UserSettingsState)[]) {
    const value = legacy[settingKey];
    if (value === undefined) continue;

    entries[getUserPreferenceKey(settingKey)] = value;
  }

  return entries;
};

const omitExistingPreferenceKeys = <T extends Record<string, T[keyof T]>>(
  entries: T,
  existingStorageKeys: Set<string>,
): Partial<T> =>
  Object.fromEntries(
    Object.entries(entries).filter(([key]) => !existingStorageKeys.has(key)),
  ) as Partial<T>;

const getConsoleUserSettingsConfigMap = async (): Promise<IoK8sApiCoreV1ConfigMap | undefined> => {
  const user = await k8sGet<K8sResourceCommon>({ model: UserModel, name: '~' });
  const userSettingsId = hashUsernameForSettings(getName(user) ?? '', getUID(user));

  if (!userSettingsId) {
    return undefined;
  }

  const configMapName = `${CONSOLE_USER_SETTINGS_CONFIG_MAP_PREFIX}${userSettingsId}`;

  try {
    return await k8sGet<IoK8sApiCoreV1ConfigMap>({
      model: ConfigMapModel,
      name: configMapName,
      ns: CONSOLE_USER_SETTINGS_NAMESPACE,
    });
  } catch {
    return undefined;
  }
};

const runLegacyKubevirtUserSettingsMigration = async (operatorNamespace: string): Promise<void> => {
  const legacy = await getLegacyUserSettings(operatorNamespace);
  if (isEmpty(legacy)) {
    return;
  }

  if (isConsoleUserSettingsLocalStorage()) {
    const existingKeys = new Set(Object.keys(readConsoleUserSettingsLocalStorage()));
    const preferenceEntries = omitExistingPreferenceKeys(
      legacySettingsToLocalStorageEntries(legacy),
      existingKeys,
    );

    if (isEmpty(preferenceEntries)) {
      return;
    }

    writeConsoleUserSettingsLocalStorage({
      ...readConsoleUserSettingsLocalStorage(),
      ...preferenceEntries,
    });
    return;
  }

  const existingUserConfigMap = await getConsoleUserSettingsConfigMap();
  const existingKeys = new Set(Object.keys(existingUserConfigMap?.data ?? {}));
  const preferenceData = omitExistingPreferenceKeys(
    legacySettingsToPreferenceEntries(legacy),
    existingKeys,
  );

  if (isEmpty(preferenceData)) {
    return;
  }

  const mergedData = { ...(existingUserConfigMap?.data ?? {}), ...preferenceData };

  if (!existingUserConfigMap) {
    const user = await k8sGet<K8sResourceCommon>({ model: UserModel, name: '~' });
    const userSettingsId = hashUsernameForSettings(getName(user) ?? '', getUID(user));

    if (!userSettingsId) {
      return;
    }

    await k8sCreate<IoK8sApiCoreV1ConfigMap>({
      data: {
        apiVersion: 'v1',
        data: mergedData,
        kind: 'ConfigMap',
        metadata: {
          name: `${CONSOLE_USER_SETTINGS_CONFIG_MAP_PREFIX}${userSettingsId}`,
          namespace: CONSOLE_USER_SETTINGS_NAMESPACE,
        },
      },
      model: ConfigMapModel,
    });
    return;
  }

  await k8sPatch<IoK8sApiCoreV1ConfigMap>({
    data: [
      {
        op: existingUserConfigMap.data ? 'replace' : 'add',
        path: '/data',
        value: mergedData,
      },
    ],
    model: ConfigMapModel,
    resource: existingUserConfigMap,
  });
};

/**
 * Starts a one-time legacy migration (direct localStorage write or ConfigMap create/patch).
 * Not tied to `useUserPreference`.
 */
export const startLegacyKubevirtUserSettingsMigration = (operatorNamespace: string): void => {
  migrationPromise ??= runLegacyKubevirtUserSettingsMigration(operatorNamespace).catch(
    () => undefined,
  );
};

export const awaitLegacyKubevirtUserSettingsMigration = (): Promise<void> =>
  migrationPromise ?? Promise.resolve();

/** @internal Test helper */
export const resetLegacyKubevirtUserSettingsMigration = (): void => {
  migrationPromise = undefined;
};

/** @internal Tests only */
export const ensureLegacyKubevirtUserSettingsMigrated = (
  operatorNamespace: string,
): Promise<void> => {
  startLegacyKubevirtUserSettingsMigration(operatorNamespace);
  return awaitLegacyKubevirtUserSettingsMigration();
};
