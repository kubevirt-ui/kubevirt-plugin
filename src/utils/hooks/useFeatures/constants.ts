import { ConfigMapModel, GroupModel, RoleModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiRbacV1Role,
  IoK8sApiRbacV1RoleBinding,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { DEFAULT_OPERATOR_NAMESPACE } from '@kubevirt-utils/utils/utils';
import { K8sVerb } from '@openshift-console/dynamic-plugin-sdk';

import { FeaturesType } from './types';

export const AUTOMATIC_SUBSCRIPTION_ACTIVATION_KEY = 'automaticSubscriptionActivationKey';
export const AUTOMATIC_SUBSCRIPTION_ORGANIZATION_ID = 'automaticSubscriptionOrganizationId';
export const AUTOMATIC_SUBSCRIPTION_CUSTOM_URL = 'automaticSubscriptionCustomUrl';
export const AUTOMATIC_SUBSCRIPTION_TYPE_KEY = 'automaticSubscriptionType';

export const INSTANCE_TYPE_ENABLED = 'instanceTypesEnabled';
export const KUBEVIRT_APISERVER_PROXY = 'kubevirtApiserverProxy';
export const LOAD_BALANCER_ENABLED = 'loadBalancerEnabled';
export const NODE_PORT_ADDRESS = 'nodePortAddress';
export const NODE_PORT_ENABLED = 'nodePortEnabled';
export const DISABLED_GUEST_SYSTEM_LOGS_ACCESS = 'disabledGuestSystemLogsAccess';
export const CONFIRM_VM_ACTIONS = 'confirmVMActions';

export const TREE_VIEW_FOLDERS = 'treeViewFolders';
export const ADVANCED_SEARCH = 'advancedSearch';

export const FEATURES_CONFIG_MAP_NAME = 'kubevirt-ui-features';
const FEATURES_ROLE_NAME = 'kubevirt-ui-features-reader';
const FEATURES_ROLE_BINDING_NAME = 'kubevirt-ui-features-reader-binding';

export const FEATURE_HCO_PERSISTENT_RESERVATION = 'persistentReservationHCO';
export const AUTOMATIC_UPDATE_FEATURE_NAME = 'auto-update-rhel-vms';

export const defaultFeatures: FeaturesType = {
  [ADVANCED_SEARCH]: 'false',
  [AUTOMATIC_SUBSCRIPTION_ACTIVATION_KEY]: '',
  [AUTOMATIC_SUBSCRIPTION_ORGANIZATION_ID]: '',
  [AUTOMATIC_UPDATE_FEATURE_NAME]: 'false',
  [CONFIRM_VM_ACTIONS]: 'false',
  [DISABLED_GUEST_SYSTEM_LOGS_ACCESS]: 'false',
  [FEATURE_HCO_PERSISTENT_RESERVATION]: 'false',
  [KUBEVIRT_APISERVER_PROXY]: 'true',
  [LOAD_BALANCER_ENABLED]: 'false',
  [NODE_PORT_ADDRESS]: '',
  [NODE_PORT_ENABLED]: 'false',
  [TREE_VIEW_FOLDERS]: 'false',
};

export const featuresConfigMapInitialState: IoK8sApiCoreV1ConfigMap = {
  data: defaultFeatures,
  metadata: {
    name: FEATURES_CONFIG_MAP_NAME,
    namespace: DEFAULT_OPERATOR_NAMESPACE,
  },
};

export const featuresRole: IoK8sApiRbacV1Role = {
  metadata: {
    name: FEATURES_ROLE_NAME,
    namespace: DEFAULT_OPERATOR_NAMESPACE,
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
    namespace: DEFAULT_OPERATOR_NAMESPACE,
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
