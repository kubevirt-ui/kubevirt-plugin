import { type K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';

export const AUTOPILOT_MANAGED_BY_LABEL = 'platform.kubevirt.io/managed-by';
export const AUTOPILOT_MANAGED_BY_VALUE = 'virt-platform-autopilot';
export const AUTOPILOT_MODE_ANNOTATION = 'platform.kubevirt.io/mode';
export const AUTOPILOT_MODE_UNMANAGED = 'unmanaged';
export const HCO_AUTOPILOT_ANNOTATION = 'platform.kubevirt.io/autopilot';

export const DESCHEDULER_OPERATOR_PACKAGE = 'cluster-kube-descheduler-operator';
export const CLUSTER_OBSERVABILITY_OPERATOR_PACKAGE = 'cluster-observability-operator';

export const KubeDeschedulerGVK: K8sGroupVersionKind = {
  group: 'operator.openshift.io',
  kind: 'KubeDescheduler',
  version: 'v1',
};

export const MetalLBGVK: K8sGroupVersionKind = {
  group: 'metallb.io',
  kind: 'MetalLB',
  version: 'v1beta1',
};

export const ForkliftControllerGVK: K8sGroupVersionKind = {
  group: 'forklift.konveyor.io',
  kind: 'ForkliftController',
  version: 'v1beta1',
};

export const UIPluginGVK: K8sGroupVersionKind = {
  group: 'observability.openshift.io',
  kind: 'UIPlugin',
  version: 'v1alpha1',
};

export const LokiStackGVK: K8sGroupVersionKind = {
  group: 'loki.grafana.com',
  kind: 'LokiStack',
  version: 'v1',
};

export const ClusterLogForwarderGVK: K8sGroupVersionKind = {
  group: 'observability.openshift.io',
  kind: 'ClusterLogForwarder',
  version: 'v1',
};
