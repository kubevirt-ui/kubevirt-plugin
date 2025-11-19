import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';

export const PVC_BOUND_STATUS = 'Bound';

export const ALREADY_MIGRATED_PVC_LALBEL =
  'migration.openshift.io/source-for-directvolumemigration';

export type SelectedMigration = {
  pvc: IoK8sApiCoreV1PersistentVolumeClaim;
  vmName: string;
  vmNamespace: string;
  volumeName: string;
};
