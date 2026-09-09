// Extracted from jobLifecycle.ts
// Root: src/views/checkups/self-validation/utils/selfValidationJob/jobLifecycle.ts

import {
  ConfigMapModel,
  JobModel,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type IoK8sApiBatchV1Job,
  type IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getName } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sDelete } from '@multicluster/k8sRequests';

import { getResultsConfigMapName } from '../selfValidationResults';

export const deleteSelfValidationJob = async (job: IoK8sApiBatchV1Job): Promise<void> => {
  const jobName = job.metadata.name;
  const namespace = job.metadata.namespace;
  const cluster = getCluster(job);

  await kubevirtK8sDelete({
    cluster,
    model: JobModel,
    resource: job,
  });

  const resultsConfigMapName = getResultsConfigMapName(jobName);
  try {
    await kubevirtK8sDelete({
      cluster,
      model: ConfigMapModel,
      resource: { metadata: { name: resultsConfigMapName, namespace } },
    });
  } catch (error) {
    kubevirtConsole.warn('Failed to delete results ConfigMap:', error);
  }

  try {
    await kubevirtK8sDelete({
      cluster,
      model: PersistentVolumeClaimModel,
      resource: { metadata: { name: jobName, namespace } },
    });
  } catch (error) {
    kubevirtConsole.warn('Failed to delete PVC:', error);
  }
};

export const deleteSelfValidationCheckup = async (
  configMap: IoK8sApiCoreV1ConfigMap,
  jobs: IoK8sApiBatchV1Job[],
): Promise<void> => {
  const errors: string[] = [];

  for (const job of jobs) {
    try {
      await deleteSelfValidationJob(job);
    } catch (error) {
      const jobName = getName(job) ?? 'unknown';
      kubevirtConsole.error(`Failed to delete job ${jobName}:`, error);
      errors.push(jobName);
    }
  }

  try {
    await kubevirtK8sDelete({
      cluster: getCluster(configMap),
      model: ConfigMapModel,
      resource: configMap,
    });
  } catch (error) {
    kubevirtConsole.error('Failed to delete tracking configmap:', error);
    errors.push(getName(configMap) ?? 'configmap');
  }

  if (errors.length > 0) {
    throw new Error(`Failed to delete resources: ${errors.join(', ')}`);
  }
};
