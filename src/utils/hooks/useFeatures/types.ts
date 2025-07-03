import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';

import {
  ADVANCED_SEARCH,
  AUTOMATIC_SUBSCRIPTION_ACTIVATION_KEY,
  AUTOMATIC_SUBSCRIPTION_ORGANIZATION_ID,
  AUTOMATIC_UPDATE_FEATURE_NAME,
  CONFIRM_VM_ACTIONS,
  DISABLED_GUEST_SYSTEM_LOGS_ACCESS,
  FEATURE_HCO_PERSISTENT_RESERVATION,
  KUBEVIRT_APISERVER_PROXY,
  LOAD_BALANCER_ENABLED,
  NODE_PORT_ADDRESS,
  NODE_PORT_ENABLED,
  TREE_VIEW_FOLDERS,
} from './constants';

export type UseFeaturesValues = {
  canEdit: boolean;
  error: Error;
  featureEnabled: boolean;
  loading: boolean;
  toggleFeature: (val: boolean) => Promise<IoK8sApiCoreV1ConfigMap>;
};

export type FeaturesType = {
  [ADVANCED_SEARCH]: string;
  [AUTOMATIC_SUBSCRIPTION_ACTIVATION_KEY]: string;
  [AUTOMATIC_SUBSCRIPTION_ORGANIZATION_ID]: string;
  [AUTOMATIC_UPDATE_FEATURE_NAME]: string;
  [CONFIRM_VM_ACTIONS]: string;
  [DISABLED_GUEST_SYSTEM_LOGS_ACCESS]: string;
  [FEATURE_HCO_PERSISTENT_RESERVATION]: string;
  [KUBEVIRT_APISERVER_PROXY]: string;
  [LOAD_BALANCER_ENABLED]: string;
  [NODE_PORT_ADDRESS]: string;
  [NODE_PORT_ENABLED]: string;
  [TREE_VIEW_FOLDERS]: string;
};
