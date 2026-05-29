import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiCoreV1PersistentVolumeClaim,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

import {
  CONFIGMAP_NAME,
  CONFIGMAP_NAMESPACE,
  CREATE_RESULTS_RESOURCES,
  generateWithNumbers,
  KUBEVIRT_VM_LATENCY_LABEL,
  STATUS_START_TIME_STAMP,
} from '../../../utils/utils';
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
  JOB_ENV_WIN_IMAGE_NAME,
  JOB_RESULTS_DIR_PATH,
  JOB_VOLUME_RESULTS,
  SELF_VALIDATION_ACCEPT_WINDOWS_EULA_KEY,
  SELF_VALIDATION_CHECKUP_IMAGE_KEY,
  SELF_VALIDATION_DRY_RUN_KEY,
  SELF_VALIDATION_LABEL_VALUE,
  SELF_VALIDATION_PVC_SIZE_KEY,
  SELF_VALIDATION_RESULTS_ONLY_LABEL,
  SELF_VALIDATION_SA,
  SELF_VALIDATION_STORAGE_CAPABILITIES_KEY,
  SELF_VALIDATION_STORAGE_CLASS_KEY,
  SELF_VALIDATION_TEST_SKIPS_KEY,
  SELF_VALIDATION_TEST_SUITES_KEY,
  SELF_VALIDATION_WIN_IMAGE_DOWNLOAD_URL_KEY,
  SELF_VALIDATION_WIN_IMAGE_NAME_KEY,
  TEST_SUITE_TIER2,
} from '../constants';

import {
  CDI_APPLY_STORAGE_PROFILE_LABEL,
  JOB_API_VERSION,
  JOB_BACKOFF_LIMIT,
  JOB_CONTAINER_NAME,
  JOB_FS_GROUP,
  JOB_IMAGE_PULL_POLICY,
  JOB_RESOURCE_LIMITS_CPU,
  JOB_RESOURCE_LIMITS_EPHEMERAL_STORAGE,
  JOB_RESOURCE_LIMITS_MEMORY,
  JOB_RESOURCE_REQUESTS_CPU,
  JOB_RESOURCE_REQUESTS_EPHEMERAL_STORAGE,
  JOB_RESOURCE_REQUESTS_MEMORY,
  JOB_RESTART_POLICY,
  PVC_ACCESS_MODE,
  PVC_STORAGE_SIZE,
  PVC_STORAGE_SIZE_PER_SUITE,
  PVC_STORAGE_SIZE_TIER2,
} from './constants';
import { generateTimestamp } from './helpers';

// ===========================
// Resource Templates
// ===========================

export type SelfValidationJobOptions = {
  acceptWindowsEula?: boolean;
  checkupImage: string;
  createResultsResources?: boolean;
  isDryRun: boolean;
  jobNameOverride?: string;
  name: string;
  namespace: string;
  pvcName?: string;
  selectedTestSuites: string[];
  storageCapabilities?: string[];
  storageClass?: string;
  testSkips?: string;
  timestamp?: string;
  winImageDownloadUrl?: string;
  winImageName?: string;
};

/**
 * Calculates the PVC storage size based on selected test suites
 * Each test suite adds 2Gi, except tier2 which takes 10Gi
 * @param selectedTestSuites - Array of test suite names
 * @returns Storage size string (e.g., "10Gi")
 */
export const calculatePVCStorageSize = (selectedTestSuites: string[]): string => {
  if (!selectedTestSuites || selectedTestSuites.length === 0) {
    return PVC_STORAGE_SIZE; // Default fallback
  }

  let totalSizeGi = 0;

  for (const suite of selectedTestSuites) {
    if (suite === TEST_SUITE_TIER2) {
      totalSizeGi += parseInt(PVC_STORAGE_SIZE_TIER2, 10);
    } else {
      totalSizeGi += parseInt(PVC_STORAGE_SIZE_PER_SUITE, 10);
    }
  }

  return `${totalSizeGi}Gi`;
};

export const selfValidationPVC = (
  jobName: string,
  namespace: string,
  pvcSize: string,
  storageClass?: string,
): IoK8sApiCoreV1PersistentVolumeClaim => {
  return {
    apiVersion: 'v1',
    kind: 'PersistentVolumeClaim',
    metadata: {
      labels: {
        [CDI_APPLY_STORAGE_PROFILE_LABEL]: 'true',
        [KUBEVIRT_VM_LATENCY_LABEL]: SELF_VALIDATION_LABEL_VALUE,
      },
      name: jobName,
      namespace,
    },
    spec: {
      accessModes: [PVC_ACCESS_MODE],
      resources: { requests: { storage: pvcSize } },
      ...(storageClass && { storageClassName: storageClass }),
    },
  };
};

type SelfValidationConfigMapOptions = {
  acceptWindowsEula?: boolean;
  checkupImage: string;
  isDryRun: boolean;
  name: string;
  namespace: string;
  pvcSize: string;
  selectedTestSuites: string[];
  storageCapabilities?: string[];
  storageClass?: string;
  testSkips?: string;
  winImageDownloadUrl?: string;
  winImageName?: string;
};

const selfValidationConfigMap = ({
  acceptWindowsEula,
  checkupImage,
  isDryRun,
  name,
  namespace,
  pvcSize,
  selectedTestSuites,
  storageCapabilities,
  storageClass,
  testSkips,
  winImageDownloadUrl,
  winImageName,
}: SelfValidationConfigMapOptions): IoK8sApiCoreV1ConfigMap => ({
  apiVersion: 'v1',
  data: {
    [SELF_VALIDATION_CHECKUP_IMAGE_KEY]: checkupImage,
    [SELF_VALIDATION_DRY_RUN_KEY]: isDryRun.toString(),
    [SELF_VALIDATION_PVC_SIZE_KEY]: pvcSize,
    [SELF_VALIDATION_TEST_SUITES_KEY]: selectedTestSuites.join(','),
    [STATUS_START_TIME_STAMP]: new Date().toISOString(),
    ...(acceptWindowsEula && {
      [SELF_VALIDATION_ACCEPT_WINDOWS_EULA_KEY]: acceptWindowsEula.toString(),
    }),
    ...(storageClass && { [SELF_VALIDATION_STORAGE_CLASS_KEY]: storageClass }),
    ...(testSkips && { [SELF_VALIDATION_TEST_SKIPS_KEY]: testSkips }),
    ...(storageCapabilities &&
      storageCapabilities.length > 0 && {
        [SELF_VALIDATION_STORAGE_CAPABILITIES_KEY]: storageCapabilities.join(','),
      }),
    ...(acceptWindowsEula &&
      winImageDownloadUrl && {
        [SELF_VALIDATION_WIN_IMAGE_DOWNLOAD_URL_KEY]: winImageDownloadUrl,
      }),
    ...(acceptWindowsEula &&
      winImageName && { [SELF_VALIDATION_WIN_IMAGE_NAME_KEY]: winImageName }),
  },
  kind: 'ConfigMap',
  metadata: {
    labels: { [KUBEVIRT_VM_LATENCY_LABEL]: SELF_VALIDATION_LABEL_VALUE },
    name,
    namespace,
  },
});

export const selfValidationJob = ({
  acceptWindowsEula,
  checkupImage,
  createResultsResources,
  isDryRun,
  jobNameOverride,
  name,
  namespace,
  pvcName,
  selectedTestSuites,
  storageCapabilities,
  storageClass,
  testSkips,
  timestamp,
  winImageDownloadUrl,
  winImageName,
}: SelfValidationJobOptions): IoK8sApiBatchV1Job => {
  const jobName = jobNameOverride || generateWithNumbers(name);
  // ConfigMap name logic:
  // - Results-only jobs with override: jobNameOverride already includes "-results" suffix
  // - Normal jobs: append "-results" suffix to generated job name
  const configMapName = createResultsResources && jobNameOverride ? jobName : `${jobName}-results`;
  const envVars = [
    { name: CONFIGMAP_NAME, value: configMapName },
    { name: CONFIGMAP_NAMESPACE, value: namespace },
    { name: JOB_ENV_DRY_RUN, value: isDryRun.toString() },
    ...(acceptWindowsEula
      ? [{ name: JOB_ENV_ACCEPT_WINDOWS_EULA, value: acceptWindowsEula.toString() }]
      : []),
    ...(acceptWindowsEula && winImageDownloadUrl
      ? [{ name: JOB_ENV_WIN_IMAGE_DOWNLOAD_URL, value: winImageDownloadUrl }]
      : []),
    ...(acceptWindowsEula && winImageName
      ? [{ name: JOB_ENV_WIN_IMAGE_NAME, value: winImageName }]
      : []),
    { name: JOB_ENV_TEST_SUITES, value: selectedTestSuites.join(',') },
    { name: JOB_ENV_TEST_SKIPS, value: testSkips || '' },
    { name: JOB_ENV_RESULTS_DIR, value: JOB_RESULTS_DIR_PATH },
    { name: JOB_ENV_TIMESTAMP, value: timestamp || generateTimestamp() },
    ...(storageClass ? [{ name: JOB_ENV_STORAGE_CLASS, value: storageClass }] : []),
    ...(storageCapabilities && storageCapabilities.length > 0
      ? [{ name: JOB_ENV_STORAGE_CAPABILITIES, value: storageCapabilities.join(',') }]
      : []),
    ...(createResultsResources ? [{ name: CREATE_RESULTS_RESOURCES, value: 'true' }] : []),
    { name: JOB_ENV_POD_NAME, valueFrom: { fieldRef: { fieldPath: 'metadata.name' } } },
    {
      name: JOB_ENV_POD_NAMESPACE,
      valueFrom: { fieldRef: { fieldPath: 'metadata.namespace' } },
    },
  ];

  const labels: Record<string, string> = {
    [KUBEVIRT_VM_LATENCY_LABEL]: SELF_VALIDATION_LABEL_VALUE,
  };
  if (createResultsResources) {
    labels[SELF_VALIDATION_RESULTS_ONLY_LABEL] = 'true';
  }

  return {
    apiVersion: JOB_API_VERSION,
    kind: 'Job',
    metadata: {
      labels,
      name: jobName,
      namespace,
    },
    spec: {
      backoffLimit: JOB_BACKOFF_LIMIT,
      ...(createResultsResources ? { ttlSecondsAfterFinished: 0 } : {}),
      template: {
        spec: {
          containers: [
            {
              env: envVars,
              image: checkupImage,
              imagePullPolicy: JOB_IMAGE_PULL_POLICY,
              name: JOB_CONTAINER_NAME,
              resources: {
                limits: {
                  cpu: JOB_RESOURCE_LIMITS_CPU,
                  'ephemeral-storage': JOB_RESOURCE_LIMITS_EPHEMERAL_STORAGE,
                  memory: JOB_RESOURCE_LIMITS_MEMORY,
                },
                requests: {
                  cpu: JOB_RESOURCE_REQUESTS_CPU,
                  'ephemeral-storage': JOB_RESOURCE_REQUESTS_EPHEMERAL_STORAGE,
                  memory: JOB_RESOURCE_REQUESTS_MEMORY,
                },
              },
              volumeMounts: [
                {
                  mountPath: JOB_RESULTS_DIR_PATH,
                  name: JOB_VOLUME_RESULTS,
                },
              ],
            },
          ],
          restartPolicy: JOB_RESTART_POLICY,
          securityContext: {
            fsGroup: JOB_FS_GROUP,
          },
          serviceAccountName: SELF_VALIDATION_SA,
          volumes: [
            {
              name: JOB_VOLUME_RESULTS,
              persistentVolumeClaim: {
                claimName: pvcName || jobName,
              },
            },
          ],
        },
      },
    },
  };
};

export { selfValidationConfigMap };
