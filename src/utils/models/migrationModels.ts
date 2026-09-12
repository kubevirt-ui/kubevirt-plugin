import { type K8sModel } from '@openshift-console/dynamic-plugin-sdk';

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

export const MigPlanModel: K8sModel = {
  abbr: 'MP',
  apiGroup: 'migration.openshift.io',
  apiVersion: 'v1alpha1',
  crd: true,
  kind: 'MigPlan',
  label: 'MigPlan',
  labelPlural: 'MigPlans',
  namespaced: true,
  plural: 'migplans',
};

export const MigMigrationModel: K8sModel = {
  abbr: 'MM',
  apiGroup: 'migration.openshift.io',
  apiVersion: 'v1alpha1',
  crd: true,
  kind: 'MigMigration',
  label: 'MigMigration',
  labelPlural: 'MigMigrations',
  namespaced: true,
  plural: 'migmigrations',
};
