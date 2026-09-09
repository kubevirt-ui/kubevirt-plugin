// Extracted from resourceTemplates.ts
// Root: src/views/checkups/self-validation/utils/selfValidationJob/resourceTemplates.ts

import { type IoK8sApiCoreV1EnvVar } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

import {
  JOB_ENV_ACCEPT_WINDOWS_EULA,
  JOB_ENV_DRY_RUN,
  JOB_ENV_POD_NAME,
  JOB_ENV_POD_NAMESPACE,
  JOB_ENV_RESULTS_DIR,
  JOB_ENV_STORAGE_CAPABILITIES,
  JOB_ENV_STORAGE_CLASS,
  JOB_ENV_TEST_SKIPS,
  JOB_ENV_TEST_SUITES,
  JOB_ENV_TIMESTAMP,
  JOB_ENV_WIN_IMAGE_DOWNLOAD_URL,
  JOB_RESULTS_DIR_PATH,
} from '../constants';

import {
  CONFIGMAP_NAME,
  CONFIGMAP_NAMESPACE,
  CREATE_RESULTS_RESOURCES,
} from '../../../utils/utils';
import { generateTimestamp } from './helpers';
import { type SelfValidationJobOptions } from './jobTemplateTypes';

const envValue = (name: string, value: string): IoK8sApiCoreV1EnvVar => ({ name, value });

const envFieldRef = (name: string, fieldPath: string): IoK8sApiCoreV1EnvVar => ({
  name,
  valueFrom: { fieldRef: { fieldPath } },
});

export const buildSelfValidationJobEnvVars = ({
  acceptWindowsEula,
  configMapName,
  createResultsResources,
  isDryRun,
  namespace,
  selectedTestSuites,
  storageCapabilities,
  storageClass,
  testSkips,
  timestamp,
  winImageDownloadUrl,
}: SelfValidationJobOptions & { configMapName: string }): IoK8sApiCoreV1EnvVar[] => {
  const envVars: IoK8sApiCoreV1EnvVar[] = [
    envValue(CONFIGMAP_NAME, configMapName),
    envValue(CONFIGMAP_NAMESPACE, namespace),
    envValue(JOB_ENV_DRY_RUN, isDryRun.toString()),
  ];

  if (acceptWindowsEula) {
    envVars.push(envValue(JOB_ENV_ACCEPT_WINDOWS_EULA, acceptWindowsEula.toString()));
    if (winImageDownloadUrl) {
      envVars.push(envValue(JOB_ENV_WIN_IMAGE_DOWNLOAD_URL, winImageDownloadUrl));
    }
  }

  envVars.push(
    envValue(JOB_ENV_TEST_SUITES, selectedTestSuites.join(',')),
    envValue(JOB_ENV_TEST_SKIPS, testSkips ?? ''),
    envValue(JOB_ENV_RESULTS_DIR, JOB_RESULTS_DIR_PATH),
    envValue(JOB_ENV_TIMESTAMP, timestamp ?? generateTimestamp()),
  );

  if (storageClass) {
    envVars.push(envValue(JOB_ENV_STORAGE_CLASS, storageClass));
  }
  if (storageCapabilities && storageCapabilities.length > 0) {
    envVars.push(envValue(JOB_ENV_STORAGE_CAPABILITIES, storageCapabilities.join(',')));
  }
  if (createResultsResources) {
    envVars.push(envValue(CREATE_RESULTS_RESOURCES, 'true'));
  }

  envVars.push(
    envFieldRef(JOB_ENV_POD_NAME, 'metadata.name'),
    envFieldRef(JOB_ENV_POD_NAMESPACE, 'metadata.namespace'),
  );

  return envVars;
};
