import { type K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const MultiClusterObservabilityModel: K8sModel = {
  abbr: 'MCO',
  apiGroup: 'observability.open-cluster-management.io',
  apiVersion: 'v1beta2',
  crd: true,
  kind: 'MultiClusterObservability',
  label: 'MultiClusterObservability',
  labelPlural: 'MultiClusterObservabilities',
  namespaced: false,
  plural: 'multiclusterobservabilities',
};

export const NodeNetworkConfigurationPolicyModel: K8sModel = {
  abbr: 'NNCP',
  apiGroup: 'nmstate.io',
  apiVersion: 'v1',
  crd: true,
  id: 'NodeNetworkConfigurationPolicy',
  kind: 'NodeNetworkConfigurationPolicy',
  label: 'NodeNetworkConfigurationPolicy',
  labelPlural: 'NodeNetworkConfigurationPolicies',
  namespaced: false,
  plural: 'nodenetworkconfigurationpolicies',
};

export const NodeNetworkConfigurationEnactmentModel: K8sModel = {
  abbr: 'NNCE',
  apiGroup: 'nmstate.io',
  apiVersion: 'v1beta1',
  crd: true,
  id: 'NodeNetworkConfigurationEnactment',
  kind: 'NodeNetworkConfigurationEnactment',
  label: 'NodeNetworkConfigurationEnactment',
  labelPlural: 'NodeNetworkConfigurationEnactments',
  namespaced: false,
  plural: 'nodenetworkconfigurationenactments',
};

export const NodeNetworkStateModel: K8sModel = {
  abbr: 'NNS',
  apiGroup: 'nmstate.io',
  apiVersion: 'v1beta1',
  crd: true,
  id: 'NodeNetworkState',
  kind: 'NodeNetworkState',
  label: 'NodeNetworkState',
  labelPlural: 'NodeNetworkStates',
  namespaced: false,
  plural: 'nodenetworkstates',
};

export const ApplicationAwareResourceQuotaModel: K8sModel = {
  abbr: 'AAQ',
  apiGroup: 'aaq.kubevirt.io',
  apiVersion: 'v1alpha1',
  crd: true,
  kind: 'ApplicationAwareResourceQuota',
  label: 'ApplicationAwareResourceQuota',
  labelPlural: 'ApplicationAwareResourceQuotas',
  namespaced: true,
  plural: 'applicationawareresourcequotas',
};

export const ApplicationAwareClusterResourceQuotaModel: K8sModel = {
  abbr: 'AACQ',
  apiGroup: 'aaq.kubevirt.io',
  apiVersion: 'v1alpha1',
  crd: true,
  kind: 'ApplicationAwareClusterResourceQuota',
  label: 'ApplicationAwareClusterResourceQuota',
  labelPlural: 'ApplicationAwareClusterResourceQuotas',
  namespaced: false,
  plural: 'applicationawareclusterresourcequotas',
};
