import { ConfigMapModel, GroupModel, RoleModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiRbacV1Role,
  IoK8sApiRbacV1RoleBinding,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { OPENSHIFT_CNV } from '@kubevirt-utils/constants/constants';
import { K8sVerb } from '@openshift-console/dynamic-plugin-sdk';

export const AUTOMATIC_SUBSCRIPTION_ACTIVATION_KEY = 'automaticSubscriptionActivationKey';
export const AUTOMATIC_SUBSCRIPTION_ORGANIZATION_ID = 'automaticSubscriptionOrganizationId';

export const INSTANCE_TYPE_ENABLED = 'instanceTypesEnabled';
export const KUBEVIRT_APISERVER_PROXY = 'kubevirtApiserverProxy';
export const LOAD_BALANCER_ENABLED = 'loadBalancerEnabled';
export const AUTOCOMPUTE_CPU_LIMITS_PREVIEW_ENABLED = 'autocomputeCPULimitsPreviewEnabled';
export const AUTOCOMPUTE_CPU_LIMITS_ENABLED = 'autocomputeCPULimitsEnabled';
export const NODE_PORT_ADDRESS = 'nodePortAddress';
export const NODE_PORT_ENABLED = 'nodePortEnabled';
export const DISABLED_GUEST_SYSTEM_LOGS_ACCESS = 'disabledGuestSystemLogsAccess';

export const FEATURES_CONFIG_MAP_NAME = 'kubevirt-ui-features';
const FEATURES_ROLE_NAME = 'kubevirt-ui-features-reader';
const FEATURES_ROLE_BINDING_NAME = 'kubevirt-ui-features-reader-binding';

export const FEATURE_HCO_PERSISTENT_RESERVATION = 'persistentReservationHCO';

export const featuresConfigMapInitialState: IoK8sApiCoreV1ConfigMap = {
  data: {
    [AUTOCOMPUTE_CPU_LIMITS_ENABLED]: 'false',
    [AUTOCOMPUTE_CPU_LIMITS_PREVIEW_ENABLED]: 'false',
    [AUTOMATIC_SUBSCRIPTION_ACTIVATION_KEY]: '',
    [AUTOMATIC_SUBSCRIPTION_ORGANIZATION_ID]: '',
    [DISABLED_GUEST_SYSTEM_LOGS_ACCESS]: 'false',
    [KUBEVIRT_APISERVER_PROXY]: 'true',
    [LOAD_BALANCER_ENABLED]: 'false',
    [NODE_PORT_ADDRESS]: '',
    [NODE_PORT_ENABLED]: 'false',
  },
  metadata: {
    name: FEATURES_CONFIG_MAP_NAME,
    namespace: OPENSHIFT_CNV,
  },
};

export const featuresRole: IoK8sApiRbacV1Role = {
  metadata: {
    name: FEATURES_ROLE_NAME,
    namespace: OPENSHIFT_CNV,
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
    namespace: OPENSHIFT_CNV,
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
