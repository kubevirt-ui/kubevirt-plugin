import { ConfigMapModel, GroupModel, RoleModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiRbacV1Role,
  IoK8sApiRbacV1RoleBinding,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { OPENSHIFT_CNV } from '@kubevirt-utils/constants/constants';

export const TOP_CONSUMERS_CARD = 'topConsumersCard';

export const KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME = 'kubevirt-user-settings';

const KUBEVIRT_USER_SETTINGS_ROLE_NAME = 'kubevirt-user-settings-reader';

const KUBEVIRT_USER_SETTINGS_ROLE_BINDING_NAME = 'kubevirt-user-settings-reader-binding';

export const userSettingsRole: IoK8sApiRbacV1Role = {
  metadata: {
    name: KUBEVIRT_USER_SETTINGS_ROLE_NAME,
    namespace: OPENSHIFT_CNV,
  },
  rules: [
    {
      apiGroups: [''],
      resourceNames: [KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME],
      resources: [ConfigMapModel.plural],
      verbs: ['list', 'get', 'update', 'patch'],
    },
  ],
};

export const userSettingsRoleBinding: IoK8sApiRbacV1RoleBinding = {
  metadata: {
    name: KUBEVIRT_USER_SETTINGS_ROLE_BINDING_NAME,
    namespace: OPENSHIFT_CNV,
  },
  roleRef: {
    apiGroup: RoleModel.apiGroup,
    kind: RoleModel.kind,
    name: KUBEVIRT_USER_SETTINGS_ROLE_NAME,
  },
  subjects: [
    {
      apiGroup: RoleModel.apiGroup,
      kind: GroupModel.kind,
      name: 'system:authenticated',
    },
  ],
};
