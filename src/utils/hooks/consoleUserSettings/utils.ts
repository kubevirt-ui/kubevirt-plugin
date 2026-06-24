import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { CONSOLE_USER_SETTINGS_NAMESPACE } from '@kubevirt-utils/hooks/useConsoleUserSettingsConfigMap/useConsoleUserSettingsConfigMap';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sGet, kubevirtK8sPatch } from '@multicluster/k8sRequests';

import { CONSOLE_USER_SETTINGS } from './useConsoleUserSettingLocalStorage/consts';
import { UpsertConsoleUserSettingArgs } from './types';

type PatchOperation = {
  op: 'add' | 'replace';
  path: string;
  value: Record<string, unknown> | string;
};

export const isConsoleUserSettingsLocalStorage = (): boolean =>
  window.SERVER_FLAGS?.userSettingsLocation === CONSOLE_USER_SETTINGS.LOCATION.LOCALSTORAGE;

export const getConfigMapValue = <T>(
  userConfigMap: IoK8sApiCoreV1ConfigMap | undefined,
  userName: string | undefined,
  loadedConfigMap: boolean,
  key: string,
  parser: (value: string | undefined) => T,
  emptyValue: T,
): T => {
  if (!isEmpty(userConfigMap) && userName) {
    return parser(userConfigMap?.data?.[key]);
  }

  if (loadedConfigMap && isEmpty(userConfigMap)) {
    return emptyValue;
  }

  return emptyValue;
};

const createConsoleUserSettingsConfigMap = (
  configMapName: string,
  data: Record<string, string>,
): IoK8sApiCoreV1ConfigMap => ({
  apiVersion: 'v1',
  data,
  kind: 'ConfigMap',
  metadata: {
    name: configMapName,
    namespace: CONSOLE_USER_SETTINGS_NAMESPACE,
  },
});

const createConsoleUserSettingsPatchData = (
  configMap: IoK8sApiCoreV1ConfigMap,
  key: string,
  serializedValue: string,
): PatchOperation[] => {
  const patchData: PatchOperation[] = [];

  if (isEmpty(configMap.data)) {
    patchData.push({ op: 'add', path: '/data', value: {} });
  }

  patchData.push({
    op: key in (configMap?.data ?? {}) ? 'replace' : 'add',
    path: `/data/${key}`,
    value: serializedValue,
  });

  return patchData;
};

export const upsertConsoleUserSetting = async ({
  cluster,
  configMapName,
  key,
  serializedValue,
  userConfigMap,
  userName,
}: UpsertConsoleUserSettingArgs): Promise<void> => {
  if (!userName || !configMapName) {
    throw new Error('User information not available');
  }

  if (isEmpty(userConfigMap)) {
    const newConfigMap = createConsoleUserSettingsConfigMap(configMapName, {
      [key]: serializedValue,
    });
    try {
      await kubevirtK8sCreate<IoK8sApiCoreV1ConfigMap>({
        cluster,
        data: newConfigMap,
        model: ConfigMapModel,
      });
    } catch (error) {
      const alreadyExistsError = error as { code?: number; response?: { status?: number } };
      if (alreadyExistsError?.response?.status !== 409 && alreadyExistsError?.code !== 409) {
        throw error;
      }

      const existingConfigMap = await kubevirtK8sGet<IoK8sApiCoreV1ConfigMap>({
        cluster,
        model: ConfigMapModel,
        name: configMapName,
        ns: CONSOLE_USER_SETTINGS_NAMESPACE,
      });
      const patchData = createConsoleUserSettingsPatchData(existingConfigMap, key, serializedValue);
      await kubevirtK8sPatch<IoK8sApiCoreV1ConfigMap>({
        cluster,
        data: patchData,
        model: ConfigMapModel,
        resource: existingConfigMap,
      });
    }
    return;
  }

  const patchData = createConsoleUserSettingsPatchData(userConfigMap, key, serializedValue);
  await kubevirtK8sPatch<IoK8sApiCoreV1ConfigMap>({
    cluster,
    data: patchData,
    model: ConfigMapModel,
    resource: userConfigMap,
  });
};
