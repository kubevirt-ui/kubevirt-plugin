import { MigPlanModel } from '@kubevirt-utils/models';
import { getNamespace } from '@kubevirt-utils/resources/shared';

import { type MigPlan, type MultiNamespaceVirtualMachineStorageMigrationPlan } from '../constants';

// Build KubeVirt-shaped spec (namespaces / virtualMachines / targetMigrationPVCs) from wizard selections.
export const buildKubeVirtShapedSpecFromMigrations = (
  selectedMigrations: {
    pvc: { metadata?: { name?: string; namespace?: string } };
    vmName: string;
    vmNamespace: string;
    volumeName: string;
  }[],
  destinationStorageClass: string,
  retentionPolicy: MultiNamespaceVirtualMachineStorageMigrationPlan['spec']['namespaces'][0]['retentionPolicy'],
): MultiNamespaceVirtualMachineStorageMigrationPlan['spec'] => {
  type Sel = (typeof selectedMigrations)[number];
  const byNs = new Map<string, Map<string, Sel[]>>();

  for (const migration of selectedMigrations) {
    const ns = migration.vmNamespace ?? getNamespace(migration.pvc);
    if (!ns) continue;
    if (!byNs.has(ns)) byNs.set(ns, new Map());
    const vmMap = byNs.get(ns);
    if (!vmMap) continue;
    if (!vmMap.has(migration.vmName)) vmMap.set(migration.vmName, []);
    vmMap.get(migration.vmName)?.push(migration);
  }

  const namespaces: MultiNamespaceVirtualMachineStorageMigrationPlan['spec']['namespaces'] = [];

  for (const [nsName, vmMap] of byNs) {
    const virtualMachines: MultiNamespaceVirtualMachineStorageMigrationPlan['spec']['namespaces'][0]['virtualMachines'] =
      [];
    for (const [vmName, migs] of vmMap) {
      virtualMachines.push({
        name: vmName,
        targetMigrationPVCs: migs.map((migration) => ({
          destinationPVC: {
            storageClassName: destinationStorageClass,
          },
          volumeName: migration.volumeName,
        })),
      });
    }
    namespaces.push({
      name: nsName,
      retentionPolicy,
      virtualMachines,
    });
  }

  return { namespaces };
};

// Normalizes a created MTC MigPlan for the wizard (KubeVirt-shaped spec + real metadata in openshift-migration).
export const normalizeMTCPlan = (
  migPlan: MigPlan,
  kubeVirtShapedSpec: MultiNamespaceVirtualMachineStorageMigrationPlan['spec'],
): MultiNamespaceVirtualMachineStorageMigrationPlan => {
  const { status: _ignored, ...rest } = migPlan;
  return {
    ...rest,
    apiVersion: `${MigPlanModel.apiGroup}/${MigPlanModel.apiVersion}`,
    kind: MigPlanModel.kind,
    spec: kubeVirtShapedSpec,
  } as MultiNamespaceVirtualMachineStorageMigrationPlan;
};
