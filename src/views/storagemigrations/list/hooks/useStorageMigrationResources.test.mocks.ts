import {
  modelToGroupVersionKind,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
  VirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import {
  type MultiNamespaceVirtualMachineStorageMigrationPlan,
  type VirtualMachineStorageMigrationPlan,
} from '@kubevirt-utils/resources/migrations/constants';

export const multiNsGVK = modelToGroupVersionKind(
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
);
export const singleNsGVK = modelToGroupVersionKind(VirtualMachineStorageMigrationPlanModel);

export const multiNsPlan = {
  apiVersion: 'migrations.kubevirt.io/v1alpha1',
  kind: 'MultiNamespaceVirtualMachineStorageMigrationPlan',
  metadata: { name: 'multi-plan-1', namespace: 'test-ns' },
  spec: {
    namespaces: [
      {
        name: 'test-ns',
        virtualMachines: [{ name: 'vm-a', targetMigrationPVCs: [{ volumeName: 'disk0' }] }],
      },
    ],
  },
} as MultiNamespaceVirtualMachineStorageMigrationPlan;

export const singleNsPlan = {
  apiVersion: 'migrations.kubevirt.io/v1alpha1',
  kind: 'VirtualMachineStorageMigrationPlan',
  metadata: { name: 'single-plan-1', namespace: 'test-ns' },
  spec: {
    virtualMachines: [{ name: 'vm-b', targetMigrationPVCs: [{ volumeName: 'disk1' }] }],
  },
} as VirtualMachineStorageMigrationPlan;
