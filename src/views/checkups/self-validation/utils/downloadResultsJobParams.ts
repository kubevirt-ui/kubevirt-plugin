// Extracted from downloadResults.ts
// Root: src/views/checkups/self-validation/utils/downloadResults.ts

import { type IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';

import { CONFIGMAP_NAME, extractConfigMapBaseName } from '../../utils/utils';
import { type ValidatedJobParameters } from './constants';
import { validateJobTimestamp } from './downloadResultsParse';
import {
  getAcceptWindowsEulaFromJob,
  getCheckupImageFromJob,
  getDryRunFromJob,
  getPVCNameFromJob,
  getStorageCapabilitiesFromJob,
  getStorageClassFromJob,
  getTestSkipsFromJob,
  getTestSuitesFromJob,
  getWinImageDownloadUrlFromJob,
} from './selfValidationJob/jobExtraction';

const logMissingJobField = (fieldName: string, job: IoK8sApiBatchV1Job): { error: true } => {
  kubevirtConsole.error(`Could not extract ${fieldName} from original job: ${job.metadata?.name}`);
  return { error: true };
};

export const validateJobParametersForResults = (
  job: IoK8sApiBatchV1Job,
): { error: boolean } | ValidatedJobParameters => {
  const cluster = getCluster(job);

  const namespace = getNamespace(job);
  if (!namespace) {
    return logMissingJobField('namespace', job);
  }

  const timestamp = validateJobTimestamp(job);
  if (!timestamp) {
    return logMissingJobField('timestamp', job);
  }

  const checkupImage = getCheckupImageFromJob(job);
  if (!checkupImage) {
    return logMissingJobField('checkup image', job);
  }

  const testSuites = getTestSuitesFromJob(job);
  if (!testSuites || testSuites.length === 0) {
    return logMissingJobField('test suites', job);
  }

  const pvcName = getPVCNameFromJob(job);
  if (!pvcName) {
    return logMissingJobField('PVC name', job);
  }

  const configMapNameEnv = job.spec?.template?.spec?.containers?.[0]?.env?.find(
    (env) => env.name === CONFIGMAP_NAME,
  );
  const resultsConfigMapName = configMapNameEnv?.value;
  if (!resultsConfigMapName) {
    return logMissingJobField('results configmap name', job);
  }

  const originalJobName = job.metadata.name;
  if (!originalJobName) {
    return logMissingJobField('job name', job);
  }

  return {
    acceptWindowsEula: getAcceptWindowsEulaFromJob(job),
    baseName: extractConfigMapBaseName(resultsConfigMapName),
    checkupImage,
    cluster,
    isDryRun: getDryRunFromJob(job),
    namespace,
    originalJobName,
    pvcName,
    resultsConfigMapName,
    resultsJobName: `${originalJobName}-results`,
    storageCapabilities: getStorageCapabilitiesFromJob(job),
    storageClass: getStorageClassFromJob(job),
    testSkips: getTestSkipsFromJob(job),
    testSuites,
    timestamp,
    winImageDownloadUrl: getWinImageDownloadUrlFromJob(job),
  };
};
