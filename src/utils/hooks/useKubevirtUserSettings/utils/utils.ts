import { ConfigMapModel, RoleBindingModel, RoleModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiRbacV1Role,
  IoK8sApiRbacV1RoleBinding,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { OPENSHIFT_CNV } from '@kubevirt-utils/constants/constants';
import { k8sCreate, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import {
  KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME,
  userSettingsRole,
  userSettingsRoleBinding,
} from './const';
import userSettingsInitialState from './userSettingsInitialState';

export const parseNestedJSON = <T>(str: string): T => {
  try {
    return JSON.parse(str, (_, val) => {
      if (typeof val === 'string') return parseNestedJSON(val);
      return val;
    });
  } catch (exc) {
    return (<unknown>str) as T;
  }
};

export const patchUserConfigMap = async (
  userConfigMap: IoK8sApiCoreV1ConfigMap,
  userName: string,
  data: { [key: string]: any },
) =>
  k8sPatch<IoK8sApiCoreV1ConfigMap>({
    data: [
      {
        op: 'replace',
        path: `/data/${userName}`,
        value: JSON.stringify(data),
      },
    ],
    model: ConfigMapModel,
    resource: userConfigMap,
  });

const createUserSettingsConfigMap = (data: IoK8sApiCoreV1ConfigMap['data']) => ({
  data,
  metadata: {
    name: KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME,
    namespace: OPENSHIFT_CNV,
  },
});

const createUserSettingsBindings = async () => {
  await k8sCreate<IoK8sApiRbacV1Role>({
    data: userSettingsRole,
    model: RoleModel,
  });

  await k8sCreate<IoK8sApiRbacV1RoleBinding>({
    data: userSettingsRoleBinding,
    model: RoleBindingModel,
  });
};

export const moveUserSettingsToOpenshiftCNV = async (userSCDefaultNS: IoK8sApiCoreV1ConfigMap) => {
  await k8sCreate<IoK8sApiCoreV1ConfigMap>({
    data: createUserSettingsConfigMap(userSCDefaultNS?.data),
    model: ConfigMapModel,
  });

  createUserSettingsBindings();
};

export const createEmptyUserSettings = async (userName: string) => {
  await k8sCreate<IoK8sApiCoreV1ConfigMap>({
    data: createUserSettingsConfigMap({ [userName]: JSON.stringify(userSettingsInitialState) }),
    model: ConfigMapModel,
  });

  createUserSettingsBindings();
};
