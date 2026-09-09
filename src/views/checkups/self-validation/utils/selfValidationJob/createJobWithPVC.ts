// Extracted from jobLifecycle.ts
// Root: src/views/checkups/self-validation/utils/selfValidationJob/jobLifecycle.ts

import { JobModel, PersistentVolumeClaimModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getUID } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sDelete } from '@multicluster/k8sRequests';

import { addOwnerReference, type WarningCallback } from './helpers';
import { selfValidationPVC } from './pvcTemplate';

export const createJobWithPVC = async (
  jobData: IoK8sApiBatchV1Job,
  cluster: string,
  namespace: string,
  pvcSize: string,
  storageClass?: string,
  onWarning?: WarningCallback,
): Promise<IoK8sApiBatchV1Job> => {
  const jobName = jobData.metadata.name;

  await kubevirtK8sCreate({
    cluster,
    data: selfValidationPVC(jobName, namespace, pvcSize, storageClass),
    model: PersistentVolumeClaimModel,
  });

  let job: IoK8sApiBatchV1Job;
  try {
    job = await kubevirtK8sCreate<IoK8sApiBatchV1Job>({
      cluster,
      data: jobData,
      model: JobModel,
    });
  } catch (error) {
    kubevirtConsole.error('Failed to create self-validation Job, cleaning up PVC:', error);
    try {
      await kubevirtK8sDelete({
        cluster,
        model: PersistentVolumeClaimModel,
        resource: { metadata: { name: jobName, namespace } },
      });
    } catch {
      // Ignore cleanup errors (PVC may not exist or already deleted)
    }
    throw error;
  }

  const jobUid = getUID(job);
  if (jobUid) {
    await addOwnerReference(
      PersistentVolumeClaimModel,
      jobName,
      namespace,
      cluster,
      {
        apiVersion: 'batch/v1',
        kind: 'Job',
        name: jobName,
        uid: jobUid,
      },
      onWarning,
    );
  }

  return job;
};
