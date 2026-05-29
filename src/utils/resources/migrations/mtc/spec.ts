import { MigPlanModel } from '@kubevirt-utils/models';
import { getNamespace } from '@kubevirt-utils/resources/shared';

import { MigPlan, MultiNamespaceVirtualMachineStorageMigrationPlan } from '../constants';

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

  selectedMigrations.forEach((m) => {
    const ns = m.vmNamespace ?? getNamespace(m.pvc);
    if (!ns) return;
    if (!byNs.has(ns)) byNs.set(ns, new Map());
    const vmMap = byNs.get(ns);
    if (!vmMap) return;
    if (!vmMap.has(m.vmName)) vmMap.set(m.vmName, []);
    vmMap.get(m.vmName)?.push(m);
  });

  const namespaces: MultiNamespaceVirtualMachineStorageMigrationPlan['spec']['namespaces'] = [];

  byNs.forEach((vmMap, nsName) => {
    const virtualMachines: MultiNamespaceVirtualMachineStorageMigrationPlan['spec']['namespaces'][0]['virtualMachines'] =
      [];
    vmMap.forEach((migs, vmName) => {
      virtualMachines.push({
        name: vmName,
        targetMigrationPVCs: migs.map((migration) => ({
          destinationPVC: {
            storageClassName: destinationStorageClass,
          },
          volumeName: migration.volumeName,
        })),
      });
    });
    namespaces.push({
      name: nsName,
      retentionPolicy,
      virtualMachines,
    });
  });

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
