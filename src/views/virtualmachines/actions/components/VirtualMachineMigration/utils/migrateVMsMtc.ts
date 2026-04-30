import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  DEFAULT_MIGRATION_NAMESPACE,
  MigMigration,
  MigMigrationModel,
  MigPlan,
  MigPlanModel,
} from '@kubevirt-utils/resources/migrations/migrationsMtcConstants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { k8sCreate, k8sGet, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { SelectedMigration } from './constants';

const getEmptyMigPlan = (namespace: string): MigPlan => ({
  apiVersion: `${MigPlanModel.apiGroup}/${MigPlanModel.apiVersion}`,
  kind: MigPlanModel.kind,
  metadata: {
    name: `migplan-${getRandomChars()}`,
    namespace: DEFAULT_MIGRATION_NAMESPACE,
  },
  spec: {
    destMigClusterRef: {
      name: 'host',
      namespace: DEFAULT_MIGRATION_NAMESPACE,
    },
    liveMigrate: true,
    namespaces: [namespace],
    srcMigClusterRef: {
      name: 'host',
      namespace: DEFAULT_MIGRATION_NAMESPACE,
    },
  },
});

const getEmptyMigMigration = (migPlan: MigPlan): MigMigration => ({
  apiVersion: `${MigMigrationModel.apiGroup}/${MigMigrationModel.apiVersion}`,
  kind: MigMigrationModel.kind,
  metadata: {
    name: `migmigration-${migPlan?.status?.suffix || getRandomChars()}`,
    namespace: DEFAULT_MIGRATION_NAMESPACE,
  },
  spec: {
    canceled: false,
    migPlanRef: {
      name: getName(migPlan),
      namespace: getNamespace(migPlan),
    },
    migrateState: true,
    quiescePods: true,
    stage: false,
  },
});

export const migrateVMsMtc = async (
  selectedMigrations: SelectedMigration[],
  allNamespacePVCs: IoK8sApiCoreV1PersistentVolumeClaim[],
  destinationStorageClass: string,
): Promise<MigMigration> => {
  const namespace = getNamespace(selectedMigrations?.[0]?.pvc);
  const selectedPVCNames = new Set(selectedMigrations.map((m) => getName(m.pvc)));

  const emptyMigPlan = getEmptyMigPlan(namespace);
  await k8sCreate<MigPlan>({ data: emptyMigPlan, model: MigPlanModel });

  const migPlanWithStatus = await k8sGet<MigPlan>({
    model: MigPlanModel,
    name: getName(emptyMigPlan),
    ns: getNamespace(emptyMigPlan),
  });

  const persistentVolumes = allNamespacePVCs.map((pvc) => ({
    capacity: pvc.status?.capacity?.storage,
    name: pvc.spec?.volumeName,
    proposedCapacity: '0',
    pvc: {
      accessModes: ['Auto'],
      hasReference: true,
      name: getName(pvc),
      namespace: getNamespace(pvc),
      ownerType: 'VirtualMachine',
      volumeMode: 'Auto',
    },
    selection: {
      action: selectedPVCNames.has(getName(pvc)) ? 'copy' : 'skip',
      copyMethod: 'block',
      storageClass: destinationStorageClass,
    },
    storageClass: pvc.spec?.storageClassName,
    supported: {
      actions: ['skip', 'copy'],
      copyMethods: ['filesystem', 'block', 'snapshot'],
    },
  }));

  await k8sPatch<MigPlan>({
    data: [{ op: 'replace', path: '/spec/persistentVolumes', value: persistentVolumes }],
    model: MigPlanModel,
    resource: migPlanWithStatus,
  });

  return k8sCreate<MigMigration>({
    data: getEmptyMigMigration(migPlanWithStatus),
    model: MigMigrationModel,
  });
};
