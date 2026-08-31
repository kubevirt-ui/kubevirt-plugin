import { ConfigMapModel, JobModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type IoK8sApiBatchV1Job,
  type IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate, kubevirtK8sDelete, kubevirtK8sPatch } from '@multicluster/k8sRequests';

import {
  isJobRunning,
  STATUS_COMPLETION_TIME_STAMP,
  STATUS_FAILURE_REASON,
  STATUS_START_TIME_STAMP,
  STATUS_SUCCEEDED,
} from '../../utils/utils';
import {
  STORAGE_CHECKUP_DEFAULT_STORAGE_CLASS,
  STORAGE_CHECKUP_LIVE_MIGRATION,
  STORAGE_CHECKUPS_BOOT_GOLDEN_IMAGE,
  STORAGE_CHECKUPS_GOLDEN_IMAGE_NOT_UP_TO_DATE,
  STORAGE_CHECKUPS_MISSING_VOLUME_SNAP_SHOT,
  STORAGE_CHECKUPS_STORAGE_WITH_RWX,
  STORAGE_CHECKUPS_UNSET_EFS_STORAGE_CLASS,
  STORAGE_CHECKUPS_VM_HOT_PLUG_VOLUME,
  STORAGE_CHECKUPS_VM_VOLUME_CLONE,
  STORAGE_CHECKUPS_WITH_CLAIM_PROPERTY_SETS,
  STORAGE_CHECKUPS_WITH_NON_RBD_STORAGE_CLASS,
} from './consts';
import { storageCheckupJob } from './storageResources';

export const deleteStorageJob = async (job: IoK8sApiBatchV1Job): Promise<void> => {
  await kubevirtK8sDelete({ cluster: getCluster(job), model: JobModel, resource: job });
};

export const deleteStorageCheckup = async (
  resource: IoK8sApiCoreV1ConfigMap,
  jobs: IoK8sApiBatchV1Job[],
): Promise<void> => {
  const errors: string[] = [];

  try {
    await kubevirtK8sDelete({ cluster: getCluster(resource), model: ConfigMapModel, resource });
  } catch (err) {
    kubevirtConsole.error('Failed to delete storage checkup ConfigMap:', err);
    errors.push(getName(resource) ?? 'configmap');
  }

  for (const job of jobs) {
    try {
      await kubevirtK8sDelete({ cluster: getCluster(job), model: JobModel, resource: job });
    } catch (err) {
      kubevirtConsole.error(`Failed to delete job ${getName(job)}:`, err);
      errors.push(getName(job) ?? 'job');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Failed to delete resources: ${errors.join(', ')}`);
  }
};

export const rerunStorageCheckup = async (
  resource: IoK8sApiCoreV1ConfigMap,
  checkupImage: string,
  jobs: IoK8sApiBatchV1Job[] = [],
): Promise<IoK8sApiBatchV1Job> => {
  const runningJobs = jobs.filter(isJobRunning);
  const deletionErrors: string[] = [];

  for (const job of runningJobs) {
    try {
      await deleteStorageJob(job);
      kubevirtConsole.log('Deleted running job:', getName(job));
    } catch (error) {
      deletionErrors.push(getName(job) ?? 'job');
      kubevirtConsole.error('Failed to delete running job:', error);
    }
  }

  if (deletionErrors.length > 0) {
    throw new Error(
      `Failed to delete running jobs: ${deletionErrors.join(', ')}. Cannot proceed with rerun.`,
    );
  }

  const isSucceeded = resource?.data?.[STATUS_SUCCEEDED] === 'true';
  const patchOperations = [
    STATUS_COMPLETION_TIME_STAMP,
    STATUS_SUCCEEDED,
    STATUS_FAILURE_REASON,
    STATUS_START_TIME_STAMP,
    ...(isSucceeded
      ? [
          STORAGE_CHECKUP_DEFAULT_STORAGE_CLASS,
          STORAGE_CHECKUP_LIVE_MIGRATION,
          STORAGE_CHECKUPS_UNSET_EFS_STORAGE_CLASS,
          STORAGE_CHECKUPS_WITH_NON_RBD_STORAGE_CLASS,
          STORAGE_CHECKUPS_VM_HOT_PLUG_VOLUME,
          STORAGE_CHECKUPS_BOOT_GOLDEN_IMAGE,
          STORAGE_CHECKUPS_STORAGE_WITH_RWX,
          STORAGE_CHECKUPS_WITH_CLAIM_PROPERTY_SETS,
          STORAGE_CHECKUPS_MISSING_VOLUME_SNAP_SHOT,
          STORAGE_CHECKUPS_GOLDEN_IMAGE_NOT_UP_TO_DATE,
          STORAGE_CHECKUPS_VM_VOLUME_CLONE,
        ]
      : []),
  ]
    .filter((key) => resource?.data?.[key])
    .map((key) => ({ op: 'remove', path: `/data/${key}` }));

  if (!isEmpty(patchOperations)) {
    await kubevirtK8sPatch<IoK8sApiCoreV1ConfigMap>({
      cluster: getCluster(resource),
      data: patchOperations,
      model: ConfigMapModel,
      resource,
    });
  }

  return kubevirtK8sCreate({
    cluster: getCluster(resource),
    data: storageCheckupJob(getName(resource), getNamespace(resource), checkupImage),
    model: JobModel,
  });
};
