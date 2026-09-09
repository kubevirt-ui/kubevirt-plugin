// Extracted from jobLifecycle.ts
// Root: src/views/checkups/self-validation/utils/selfValidationJob/jobLifecycle.ts

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type IoK8sApiBatchV1Job,
  type IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getName } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

import {
  LEGACY_WIN_IMAGE_NAME_KEY,
  SELF_VALIDATION_ACCEPT_WINDOWS_EULA_KEY,
  SELF_VALIDATION_CHECKUP_IMAGE_KEY,
  SELF_VALIDATION_DRY_RUN_KEY,
  SELF_VALIDATION_PVC_SIZE_KEY,
  SELF_VALIDATION_STORAGE_CAPABILITIES_KEY,
  SELF_VALIDATION_STORAGE_CLASS_KEY,
  SELF_VALIDATION_TEST_SKIPS_KEY,
  SELF_VALIDATION_TEST_SUITES_KEY,
  SELF_VALIDATION_WIN_IMAGE_DOWNLOAD_URL_KEY,
} from '../constants';

import { STATUS_COMPLETION_TIME_STAMP, STATUS_START_TIME_STAMP } from '../../../utils/utils';
import { createJobWithPVC } from './createJobWithPVC';
import { deleteSelfValidationJob } from './deleteJob';
import { type WarningCallback } from './helpers';
import { isJobRunning } from './jobExtraction';
import { selfValidationJob } from './jobTemplate';

type PatchOperation = {
  op: string;
  path: string;
  value?: string;
};

export const rerunSelfValidationCheckup = async (
  configMap: IoK8sApiCoreV1ConfigMap,
  jobs: IoK8sApiBatchV1Job[],
  onWarning?: WarningCallback,
): Promise<IoK8sApiBatchV1Job> => {
  const cluster = getCluster(configMap);
  const name = configMap.metadata?.name;
  const namespace = configMap.metadata?.namespace;
  if (!name || !namespace) {
    throw new Error('Cannot rerun checkup: ConfigMap is missing name or namespace');
  }
  const testSuites = configMap?.data?.[SELF_VALIDATION_TEST_SUITES_KEY]?.split(',');

  if (!testSuites || testSuites.length === 0) {
    throw new Error('Cannot rerun checkup: ConfigMap is missing test suites data');
  }

  const isDryRun = configMap?.data?.[SELF_VALIDATION_DRY_RUN_KEY] === 'true';
  const acceptWindowsEula = configMap?.data?.[SELF_VALIDATION_ACCEPT_WINDOWS_EULA_KEY] === 'true';
  const imageFromConfigMap = configMap?.data?.[SELF_VALIDATION_CHECKUP_IMAGE_KEY];
  const storageClass = configMap?.data?.[SELF_VALIDATION_STORAGE_CLASS_KEY];
  const testSkips = configMap?.data?.[SELF_VALIDATION_TEST_SKIPS_KEY];
  const pvcSize = configMap?.data?.[SELF_VALIDATION_PVC_SIZE_KEY];
  const storageCapabilities =
    configMap?.data?.[SELF_VALIDATION_STORAGE_CAPABILITIES_KEY]?.split(',');
  const winImageDownloadUrl = acceptWindowsEula
    ? configMap?.data?.[SELF_VALIDATION_WIN_IMAGE_DOWNLOAD_URL_KEY]
    : undefined;

  if (!imageFromConfigMap) {
    throw new Error('Cannot rerun checkup: no checkup image configured in ConfigMap');
  }

  if (!pvcSize) {
    throw new Error('Cannot rerun checkup: no PVC size configured in ConfigMap');
  }

  const runningJobs = jobs.filter((job) => isJobRunning(job));
  const deletionErrors: string[] = [];

  for (const job of runningJobs) {
    try {
      await deleteSelfValidationJob(job);
      kubevirtConsole.log('Deleted running job:', getName(job));
    } catch (error) {
      deletionErrors.push(getName(job) ?? 'unknown');
      kubevirtConsole.error('Failed to delete running job:', error);
    }
  }

  if (deletionErrors.length > 0) {
    throw new Error(
      `Failed to delete running jobs: ${deletionErrors.join(', ')}. Cannot proceed with rerun.`,
    );
  }

  const patchOperations: PatchOperation[] = [];

  if (configMap?.data?.[STATUS_COMPLETION_TIME_STAMP]) {
    patchOperations.push({ op: 'remove', path: `/data/${STATUS_COMPLETION_TIME_STAMP}` });
  }

  if (configMap?.data?.[LEGACY_WIN_IMAGE_NAME_KEY]) {
    patchOperations.push({ op: 'remove', path: `/data/${LEGACY_WIN_IMAGE_NAME_KEY}` });
  }

  patchOperations.push({
    op: 'replace',
    path: `/data/${STATUS_START_TIME_STAMP}`,
    value: new Date().toISOString(),
  });

  try {
    await kubevirtK8sPatch({
      cluster,
      data: patchOperations,
      model: ConfigMapModel,
      resource: { metadata: { name, namespace } },
    });
  } catch (error) {
    kubevirtConsole.error('Failed to reset initial configmap:', error);
  }

  const jobData = selfValidationJob({
    acceptWindowsEula,
    checkupImage: imageFromConfigMap,
    isDryRun,
    name,
    namespace,
    selectedTestSuites: testSuites,
    storageCapabilities,
    storageClass,
    testSkips,
    winImageDownloadUrl,
  });

  return createJobWithPVC(jobData, cluster, namespace, pvcSize, storageClass, onWarning);
};
