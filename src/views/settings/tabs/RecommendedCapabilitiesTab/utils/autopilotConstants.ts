import { type K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const AUTOPILOT_MANAGED_BY_LABEL = 'platform.kubevirt.io/managed-by';
export const AUTOPILOT_MANAGED_BY_VALUE = 'virt-platform-autopilot';
export const AUTOPILOT_MODE_ANNOTATION = 'platform.kubevirt.io/mode';
export const AUTOPILOT_MODE_UNMANAGED = 'unmanaged';
export const HCO_AUTOPILOT_ANNOTATION = 'platform.kubevirt.io/autopilot';

export const DESCHEDULER_OPERATOR_PACKAGE = 'cluster-kube-descheduler-operator';
export const CLUSTER_OBSERVABILITY_OPERATOR_PACKAGE = 'cluster-observability-operator';

export const KubeDeschedulerModel: K8sModel = {
  abbr: 'KD',
  apiGroup: 'operator.openshift.io',
  apiVersion: 'v1',
  crd: true,
  kind: 'KubeDescheduler',
  label: 'KubeDescheduler',
  labelPlural: 'KubeDeschedulers',
  namespaced: true,
  plural: 'kubedeschedulers',
};

export const MetalLBModel: K8sModel = {
  abbr: 'MLB',
  apiGroup: 'metallb.io',
  apiVersion: 'v1beta1',
  crd: true,
  kind: 'MetalLB',
  label: 'MetalLB',
  labelPlural: 'MetalLBs',
  namespaced: true,
  plural: 'metallbs',
};

export const ForkliftControllerModel: K8sModel = {
  abbr: 'FC',
  apiGroup: 'forklift.konveyor.io',
  apiVersion: 'v1beta1',
  crd: true,
  kind: 'ForkliftController',
  label: 'ForkliftController',
  labelPlural: 'ForkliftControllers',
  namespaced: true,
  plural: 'forkliftcontrollers',
};

export const UIPluginModel: K8sModel = {
  abbr: 'UIP',
  apiGroup: 'observability.openshift.io',
  apiVersion: 'v1alpha1',
  crd: true,
  kind: 'UIPlugin',
  label: 'UIPlugin',
  labelPlural: 'UIPlugins',
  namespaced: false,
  plural: 'uiplugins',
};

export const LokiStackModel: K8sModel = {
  abbr: 'LS',
  apiGroup: 'loki.grafana.com',
  apiVersion: 'v1',
  crd: true,
  kind: 'LokiStack',
  label: 'LokiStack',
  labelPlural: 'LokiStacks',
  namespaced: true,
  plural: 'lokistacks',
};

export const ClusterLogForwarderModel: K8sModel = {
  abbr: 'CLF',
  apiGroup: 'observability.openshift.io',
  apiVersion: 'v1',
  crd: true,
  kind: 'ClusterLogForwarder',
  label: 'ClusterLogForwarder',
  labelPlural: 'ClusterLogForwarders',
  namespaced: true,
  plural: 'clusterlogforwarders',
};
