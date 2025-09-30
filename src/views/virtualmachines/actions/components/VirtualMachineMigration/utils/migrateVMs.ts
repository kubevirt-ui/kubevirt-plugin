import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  DEFAULT_MIGRATION_NAMESPACE,
  MigMigration,
  MigMigrationModel,
  MigPlan,
  MigPlanModel,
} from '@kubevirt-utils/resources/migrations/constants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate, kubevirtK8sGet, kubevirtK8sPatch } from '@multicluster/k8sRequests';

export const getEmptyMigPlan = (namespaces: string[]): MigPlan => ({
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
    namespaces: namespaces,
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

export const migrateVMs = async (
  migPlan: MigPlan,
  namespacePVCs: IoK8sApiCoreV1PersistentVolumeClaim[],
  selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[],
  destinationStorageClass: string,
) => {
  const cluster = getCluster(migPlan);
  const migPlanWithStatus = await kubevirtK8sGet<MigPlan>({
    cluster,
    model: MigPlanModel,
    name: getName(migPlan),
    ns: getNamespace(migPlan),
  });

  const suffix = migPlanWithStatus.status?.suffix || getRandomChars();

  const persistentVolumes = namespacePVCs.map((pvc) => {
    const pvcOriginalName = getName(pvc);

    const pvcNewName = `${pvcOriginalName.replace(/-mig-[\d\w]+/, '')}-mig-${suffix}`;

    return {
      capacity: pvc.status.capacity?.storage,
      name: pvc.spec.volumeName,
      proposedCapacity: '0',
      pvc: {
        accessModes: ['Auto'],
        hasReference: true,
        name: `${pvcOriginalName}:${pvcNewName}`,
        namespace: getNamespace(pvc),
        ownerType: 'VirtualMachine',
        volumeMode: 'Auto',
      },
      selection: {
        action: selectedPVCs.find((selectedPVC) => getName(selectedPVC) === pvcOriginalName)
          ? 'copy'
          : 'skip',
        copyMethod: 'block',
        storageClass: destinationStorageClass,
      },
      storageClass: pvc.spec.storageClassName,
      supported: {
        actions: ['skip', 'copy'],
        copyMethods: ['filesystem', 'block', 'snapshot'],
      },
    };
  });

  await kubevirtK8sPatch<MigPlan>({
    cluster,
    data: [{ op: 'replace', path: '/spec/persistentVolumes', value: persistentVolumes }],
    model: MigPlanModel,
    resource: migPlanWithStatus,
  });

  return kubevirtK8sCreate({
    cluster,
    data: getEmptyMigMigration(migPlanWithStatus),
    model: MigMigrationModel,
  });
};
