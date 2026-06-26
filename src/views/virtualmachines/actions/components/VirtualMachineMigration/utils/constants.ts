import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

export const PVC_BOUND_STATUS = 'Bound';

export const ALREADY_MIGRATED_PVC_LALBEL =
  'migration.openshift.io/source-for-directvolumemigration';

export const MIGPLAN_PREFIX = 'migplan';
export const MIGRATION_PREFIX = 'migration';

export type SelectedMigration = {
  pvc: IoK8sApiCoreV1PersistentVolumeClaim;
  vmName: string;
  vmNamespace: string;
  volumeName: string;
};
