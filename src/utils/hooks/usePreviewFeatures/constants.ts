import { ConfigMapModel, GroupModel, RoleModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiRbacV1Role,
  IoK8sApiRbacV1RoleBinding,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';

export const INSTANCE_TYPE_ENABLED = 'instanceTypesEnabled';

export const PREVIEW_FEATURES_CONFIG_MAP_NAME = 'kubevirt-ui-preview-features';
const PREVIEW_FEATURES_ROLE_NAME = 'kubevirt-ui-preview-features-reader';
const PREVIEW_FEATURES_ROLE_BINDING_NAME = 'kubevirt-ui-preview-features-reader-binding';

export const previewFeaturesConfigMapInitialState: IoK8sApiCoreV1ConfigMap = {
  data: { [INSTANCE_TYPE_ENABLED]: 'false' },
  metadata: {
    name: PREVIEW_FEATURES_CONFIG_MAP_NAME,
    namespace: DEFAULT_NAMESPACE,
  },
};

export const previewFeaturesRole: IoK8sApiRbacV1Role = {
  metadata: {
    name: PREVIEW_FEATURES_ROLE_NAME,
    namespace: DEFAULT_NAMESPACE,
  },
  rules: [
    {
      apiGroups: [''],
      resourceNames: [PREVIEW_FEATURES_CONFIG_MAP_NAME],
      resources: [ConfigMapModel.plural],
      verbs: ['list', 'get'],
    },
  ],
};

export const previewFeaturesRoleBinding: IoK8sApiRbacV1RoleBinding = {
  metadata: {
    name: PREVIEW_FEATURES_ROLE_BINDING_NAME,
    namespace: DEFAULT_NAMESPACE,
  },
  roleRef: {
    apiGroup: RoleModel.apiGroup,
    kind: RoleModel.kind,
    name: PREVIEW_FEATURES_ROLE_NAME,
  },
  subjects: [
    {
      apiGroup: RoleModel.apiGroup,
      kind: GroupModel.kind,
      name: 'system:authenticated',
    },
  ],
};
