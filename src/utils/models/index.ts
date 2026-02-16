import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export * from '@kubevirt-ui-ext/kubevirt-api/console';

export const UploadTokenRequestModel: K8sModel = {
  abbr: 'utr',
  apiGroup: 'upload.cdi.kubevirt.io',
  apiVersion: 'v1beta1',
  crd: true,
  id: 'uploadtokenrequest',
  kind: 'UploadTokenRequest',
  label: 'Upload Token Request',
  labelPlural: 'Upload Token Requests',
  namespaced: true,
  plural: 'uploadtokenrequests',
};

export const QuickStartModel: K8sModel = {
  abbr: 'CQS',
  apiGroup: 'console.openshift.io',
  apiVersion: 'v1',
  crd: true,
  kind: 'ConsoleQuickStart',
  label: 'ConsoleQuickStart',
  labelPlural: 'ConsoleQuickStarts',
  namespaced: false,
  plural: 'consolequickstarts',
  propagationPolicy: 'Background',
};

export const DNSConfigModel: K8sModel = {
  abbr: 'DNS',
  apiGroup: 'config.openshift.io',
  apiVersion: 'v1',
  crd: false,
  kind: 'DNS',
  label: 'DNS',
  labelPlural: 'DNSes',
  namespaced: false,
  plural: 'dnses',
};

export const OperatorGroupModel: K8sModel = {
  abbr: 'OG',
  apiGroup: 'operators.coreos.com',
  apiVersion: 'v1',
  crd: true,
  kind: 'OperatorGroup',
  label: 'OperatorGroup',
  labelKey: 'olm~OperatorGroup',
  labelPlural: 'OperatorGroups',
  labelPluralKey: 'olm~OperatorGroups',
  namespaced: true,
  plural: 'operatorgroups',
};

export const ClusterManagementAddOnModel: K8sModel = {
  abbr: 'CMA',
  apiGroup: 'addon.open-cluster-management.io',
  apiVersion: 'v1alpha1',
  crd: true,
  kind: 'ClusterManagementAddOn',
  label: 'ClusterManagementAddOn',
  labelPlural: 'ClusterManagementAddOns',
  namespaced: true,
  plural: 'clustermanagementaddons',
};

export const VirtualMachineSubresourcesModel: K8sModel = {
  abbr: 'VM',
  apiGroup: 'subresources.kubevirt.io',
  apiVersion: 'v1',
  kind: 'VirtualMachine',
  label: 'VirtualMachine',
  labelPlural: 'VirtualMachines',
  namespaced: true,
  plural: 'virtualmachines',
};

export const VirtualMachineInstanceSubresourcesModel: K8sModel = {
  abbr: 'VMI',
  apiGroup: 'subresources.kubevirt.io',
  apiVersion: 'v1',
  kind: 'VirtualMachineInstance',
  label: 'VirtualMachineInstance',
  labelPlural: 'VirtualMachineInstances',
  namespaced: true,
  plural: 'virtualmachineinstances',
};

export const VirtualMachineStorageMigrationPlanModel: K8sModel = {
  abbr: 'VMSM',
  apiGroup: 'migrations.kubevirt.io',
  apiVersion: 'v1alpha1',
  crd: true,
  kind: 'VirtualMachineStorageMigrationPlan',
  label: 'VirtualMachineStorageMigrationPlan',
  labelPlural: 'VirtualMachineStorageMigrationPlans',
  namespaced: true,
  plural: 'virtualmachinestoragemigrationplans',
};

export const VirtualMachineStorageMigrationModel: K8sModel = {
  abbr: 'VMSM',
  apiGroup: 'migrations.kubevirt.io',
  apiVersion: 'v1alpha1',
  crd: true,
  kind: 'VirtualMachineStorageMigration',
  label: 'VirtualMachineStorageMigration',
  labelPlural: 'VirtualMachineStorageMigrations',
  namespaced: true,
  plural: 'virtualmachinestoragemigrations',
};

export const MultiNamespaceVirtualMachineStorageMigrationPlanModel: K8sModel = {
  abbr: 'MNSM',
  apiGroup: 'migrations.kubevirt.io',
  apiVersion: 'v1alpha1',
  crd: true,
  kind: 'MultiNamespaceVirtualMachineStorageMigrationPlan',
  label: 'MultiNamespaceVirtualMachineStorageMigrationPlan',
  labelPlural: 'MultiNamespaceVirtualMachineStorageMigrationPlans',
  namespaced: true,
  plural: 'multinamespacevirtualmachinestoragemigrationplans',
};

export const MultiNamespaceVirtualMachineStorageMigrationModel: K8sModel = {
  abbr: 'MNSM',
  apiGroup: 'migrations.kubevirt.io',
  apiVersion: 'v1alpha1',
  crd: true,
  kind: 'MultiNamespaceVirtualMachineStorageMigration',
  label: 'MultiNamespaceVirtualMachineStorageMigration',
  labelPlural: 'MultiNamespaceVirtualMachineStorageMigrations',
  namespaced: true,
  plural: 'multinamespacevirtualmachinestoragemigrations',
};

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
