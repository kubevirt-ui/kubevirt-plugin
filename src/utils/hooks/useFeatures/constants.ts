import { ConfigMapModel, GroupModel, RoleModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiRbacV1Role,
  IoK8sApiRbacV1RoleBinding,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { K8sVerb } from '@openshift-console/dynamic-plugin-sdk';

export const INSTANCE_TYPE_ENABLED = 'instanceTypesEnabled';
export const LOAD_BALANCER_ENABLED = 'loadBalancerEnabled';

export const FEATURES_CONFIG_MAP_NAME = 'kubevirt-ui-features';
const FEATURES_ROLE_NAME = 'kubevirt-ui-features-reader';
const FEATURES_ROLE_BINDING_NAME = 'kubevirt-ui-features-reader-binding';

export const featuresConfigMapInitialState: IoK8sApiCoreV1ConfigMap = {
  data: { [INSTANCE_TYPE_ENABLED]: 'false', [LOAD_BALANCER_ENABLED]: 'false' },
  metadata: {
    name: FEATURES_CONFIG_MAP_NAME,
    namespace: DEFAULT_NAMESPACE,
  },
};

export const featuresRole: IoK8sApiRbacV1Role = {
  metadata: {
    name: FEATURES_ROLE_NAME,
    namespace: DEFAULT_NAMESPACE,
  },
  rules: [
    {
      apiGroups: [''],
      resourceNames: [FEATURES_CONFIG_MAP_NAME],
      resources: [ConfigMapModel.plural],
      verbs: ['list', 'get', 'watch'] as K8sVerb[],
    },
  ],
};

export const featuresRoleBinding: IoK8sApiRbacV1RoleBinding = {
  metadata: {
    name: FEATURES_ROLE_BINDING_NAME,
    namespace: DEFAULT_NAMESPACE,
  },
  roleRef: {
    apiGroup: RoleModel.apiGroup,
    kind: RoleModel.kind,
    name: FEATURES_ROLE_NAME,
  },
  subjects: [
    {
      apiGroup: RoleModel.apiGroup,
      kind: GroupModel.kind,
      name: 'system:authenticated',
    },
  ],
};
