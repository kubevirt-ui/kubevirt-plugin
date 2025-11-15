import {
  ConfigMapModel,
  JobModel,
  PersistentVolumeClaimModel,
  RouteModel,
  ServiceModel,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiCoreV1PersistentVolumeClaim,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import {
  k8sCreate,
  k8sDelete,
  k8sList,
  K8sModel,
  k8sPatch,
} from '@openshift-console/dynamic-plugin-sdk';

import {
  CONFIGMAP_NAME,
  CONFIGMAP_NAMESPACE,
  generateWithNumbers,
  getJobContainers,
  KUBEVIRT_VM_LATENCY_LABEL,
  STATUS_COMPLETION_TIME_STAMP,
  STATUS_START_TIME_STAMP,
} from '../../utils/utils';

import {
  getResultsConfigMapName,
  SELF_VALIDATION_CHECKUP_IMAGE_KEY,
  SELF_VALIDATION_DRY_RUN_KEY,
  SELF_VALIDATION_LABEL_VALUE,
  SELF_VALIDATION_RESULTS_KEY,
  SELF_VALIDATION_SA,
  SELF_VALIDATION_STORAGE_CAPABILITIES_KEY,
  SELF_VALIDATION_STORAGE_CLASS_KEY,
  SELF_VALIDATION_TEST_SKIPS_KEY,
  SELF_VALIDATION_TEST_SUITES_KEY,
} from './constants';
import { installPermissions, uninstallPermissions } from './selfValidationPermissions';

// ===========================
// Helper Functions
// ===========================

const generateTimestamp = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
};

/**
 * Helper function to derive nginx resource names from a job name
 * Example: job "ocp-virt-self-validation-violet-tahr-26-8077"
 * -> last 3 segments: "tahr-26-8077"
 * -> nginx job: "pvc-reader-tahr-26-8077"
 * -> nginx configmap: "nginx-conf-tahr-26-8077"
 * -> service/route: "tahr-26-8077"
 */
const getNginxResourceNames = (jobName: string) => {
  const nameParts = jobName.split('-');
  const lastThreeSegments = nameParts.slice(-3).join('-');
  return {
    configMapName: `nginx-conf-${lastThreeSegments}`,
    jobName: `pvc-reader-${lastThreeSegments}`,
    routeName: lastThreeSegments,
    serviceName: lastThreeSegments,
  };
};

/**
 * Adds an owner reference to a Kubernetes resource
 * Ensures dependent resources are automatically cleaned up when the owner is deleted
 * @param model - The Kubernetes model for the resource to patch
 * @param resourceName - Name of the resource to add the owner reference to
 * @param namespace - Namespace of the resource
 * @param owner - Owner resource details (apiVersion, kind, name, uid)
 */
export const addOwnerReference = async (
  model: K8sModel,
  resourceName: string,
  namespace: string,
  owner: {
    apiVersion: string;
    kind: string;
    name: string;
    uid: string;
  },
): Promise<void> => {
  try {
    await k8sPatch({
      data: [
        {
          op: 'add',
          path: '/metadata/ownerReferences',
          value: [
            {
              apiVersion: owner.apiVersion,
              blockOwnerDeletion: true,
              kind: owner.kind,
              name: owner.name,
              uid: owner.uid,
            },
          ],
        },
      ],
      model,
      resource: { metadata: { name: resourceName, namespace } },
    });
  } catch (error) {
    kubevirtConsole.warn(`Failed to add owner reference to ${model.kind}:`, error);
  }
};

// ===========================
// Job Information Extraction
// ===========================

export const getTestSuitesFromJob = (job: IoK8sApiBatchV1Job): string[] => {
  if (!getJobContainers(job)?.[0]?.env) {
    return [];
  }

  const testSuitesEnv = job.spec.template.spec.containers[0].env.find(
    (env) => env.name === 'TEST_SUITES',
  );

  if (!testSuitesEnv?.value) {
    return [];
  }

  return testSuitesEnv.value
    .split(',')
    .map((suite) => suite.trim())
    .filter(Boolean);
};

export const getDryRunFromJob = (job: IoK8sApiBatchV1Job): boolean => {
  if (!getJobContainers(job)?.[0]?.env) {
    return false;
  }

  const dryRunEnv = job.spec.template.spec.containers[0].env.find((env) => env.name === 'DRY_RUN');

  return dryRunEnv?.value === 'true';
};

export const getCheckupImageFromJob = (job: IoK8sApiBatchV1Job): string => {
  return getJobContainers(job)?.[0]?.image || '';
};

export const isJobRunning = (job: IoK8sApiBatchV1Job): boolean => {
  return !!job?.status?.active;
};

/**
 * Fetches all running self-validation jobs across the cluster
 * @returns Array of running job objects
 */
export const getAllRunningSelfValidationJobs = async (): Promise<IoK8sApiBatchV1Job[]> => {
  try {
    const response = await k8sList<IoK8sApiBatchV1Job>({
      model: JobModel,
      queryParams: {
        labelSelector: {
          matchLabels: {
            [KUBEVIRT_VM_LATENCY_LABEL]: SELF_VALIDATION_LABEL_VALUE,
          },
        },
      },
    });

    const jobs = Array.isArray(response) ? response : response?.items || [];
    return jobs.filter(isJobRunning);
  } catch (error) {
    kubevirtConsole.error('Failed to fetch running self-validation jobs:', error);
    return [];
  }
};

export const getTimestampFromJob = (job: IoK8sApiBatchV1Job): null | string => {
  if (!getJobContainers(job)?.[0]?.env) {
    return null;
  }

  const timestampEnv = job.spec.template.spec.containers[0].env.find(
    (env) => env.name === 'TIMESTAMP',
  );

  return timestampEnv?.value || null;
};

// ===========================
// Resource Templates
// ===========================

export const selfValidationPVC = (
  jobName: string,
  namespace: string,
  storageClass?: string,
): IoK8sApiCoreV1PersistentVolumeClaim => ({
  apiVersion: 'v1',
  kind: 'PersistentVolumeClaim',
  metadata: {
    labels: { [KUBEVIRT_VM_LATENCY_LABEL]: SELF_VALIDATION_LABEL_VALUE },
    name: jobName,
    namespace,
  },
  spec: {
    accessModes: ['ReadWriteOnce'],
    resources: { requests: { storage: '10Gi' } },
    ...(storageClass && { storageClassName: storageClass }),
  },
});

const selfValidationConfigMap = (
  namespace: string,
  name: string,
  checkupImage: string,
  selectedTestSuites: string[],
  isDryRun: boolean,
  storageClass?: string,
  testSkips?: string,
  storageCapabilities?: string[],
): IoK8sApiCoreV1ConfigMap => ({
  apiVersion: 'v1',
  data: {
    [SELF_VALIDATION_CHECKUP_IMAGE_KEY]: checkupImage,
    [SELF_VALIDATION_DRY_RUN_KEY]: isDryRun.toString(),
    [SELF_VALIDATION_TEST_SUITES_KEY]: selectedTestSuites.join(','),
    [STATUS_START_TIME_STAMP]: new Date().toISOString(),
    ...(storageClass && { [SELF_VALIDATION_STORAGE_CLASS_KEY]: storageClass }),
    ...(testSkips && { [SELF_VALIDATION_TEST_SKIPS_KEY]: testSkips }),
    ...(storageCapabilities &&
      storageCapabilities.length > 0 && {
        [SELF_VALIDATION_STORAGE_CAPABILITIES_KEY]: storageCapabilities.join(','),
      }),
  },
  kind: 'ConfigMap',
  metadata: {
    labels: { [KUBEVIRT_VM_LATENCY_LABEL]: SELF_VALIDATION_LABEL_VALUE },
    name,
    namespace,
  },
});

export const selfValidationJob = (
  name: string,
  namespace: string,
  checkupImage: string,
  selectedTestSuites: string[],
  isDryRun: boolean,
  storageClass?: string,
  testSkips?: string,
  storageCapabilities?: string[],
): IoK8sApiBatchV1Job => {
  const jobName = generateWithNumbers(name);
  return {
    apiVersion: 'batch/v1',
    kind: 'Job',
    metadata: {
      labels: { [KUBEVIRT_VM_LATENCY_LABEL]: SELF_VALIDATION_LABEL_VALUE },
      name: jobName,
      namespace,
    },
    spec: {
      backoffLimit: 0,
      template: {
        spec: {
          containers: [
            {
              env: [
                { name: CONFIGMAP_NAME, value: `${jobName}-results` },
                { name: CONFIGMAP_NAMESPACE, value: namespace },
                { name: 'DRY_RUN', value: isDryRun.toString() },
                { name: 'TEST_SUITES', value: selectedTestSuites.join(',') },
                { name: 'TEST_SKIPS', value: testSkips || '' },
                { name: 'RESULTS_DIR', value: '/results' },
                { name: 'TIMESTAMP', value: generateTimestamp() },
                ...(storageClass ? [{ name: 'STORAGE_CLASS', value: storageClass }] : []),
                ...(storageCapabilities && storageCapabilities.length > 0
                  ? [{ name: 'STORAGE_CAPABILITIES', value: storageCapabilities.join(',') }]
                  : []),
                { name: 'POD_NAME', valueFrom: { fieldRef: { fieldPath: 'metadata.name' } } },
                {
                  name: 'POD_NAMESPACE',
                  valueFrom: { fieldRef: { fieldPath: 'metadata.namespace' } },
                },
              ],
              image: checkupImage,
              imagePullPolicy: 'Always',
              name: 'self-validation-checkup',
              resources: {
                limits: {
                  cpu: '2',
                  'ephemeral-storage': '10Gi',
                  memory: '4Gi',
                },
                requests: {
                  cpu: '500m',
                  'ephemeral-storage': '5Gi',
                  memory: '1Gi',
                },
              },
              volumeMounts: [
                {
                  mountPath: '/results',
                  name: 'results-volume',
                },
              ],
            },
          ],
          restartPolicy: 'Never',
          securityContext: {
            fsGroup: 1001,
          },
          serviceAccountName: SELF_VALIDATION_SA,
          volumes: [
            {
              name: 'results-volume',
              persistentVolumeClaim: {
                claimName: jobName,
              },
            },
          ],
        },
      },
    },
  };
};

// ===========================
// Job Lifecycle Management
// ===========================

/**
 * Creates a new self-validation checkup with all required resources
 * Creates: PVC, tracking ConfigMap, Job, and sets up owner references for auto-cleanup
 * @param namespace - Kubernetes namespace
 * @param name - Base name for the checkup
 * @param checkupImage - Container image to use for the checkup
 * @param selectedTestSuites - Array of test suite names to run
 * @param isDryRun - Whether to run in dry-run mode
 * @returns The created Job resource
 */
export const createSelfValidationCheckup = async (
  namespace: string,
  name: string,
  checkupImage: string,
  selectedTestSuites: string[],
  isDryRun: boolean,
  storageClass?: string,
  testSkips?: string,
  storageCapabilities?: string[],
): Promise<IoK8sApiBatchV1Job> => {
  const jobData = selfValidationJob(
    name,
    namespace,
    checkupImage,
    selectedTestSuites,
    isDryRun,
    storageClass,
    testSkips,
    storageCapabilities,
  );
  const jobName = jobData.metadata.name;

  // Create PVC first
  await k8sCreate({
    data: selfValidationPVC(jobName, namespace, storageClass),
    model: PersistentVolumeClaimModel,
  });

  await k8sCreate({
    data: selfValidationConfigMap(
      namespace,
      name,
      checkupImage,
      selectedTestSuites,
      isDryRun,
      storageClass,
      testSkips,
      storageCapabilities,
    ),
    model: ConfigMapModel,
  });

  // Create Job and capture its UID
  const job = await k8sCreate<IoK8sApiBatchV1Job>({
    data: jobData,
    model: JobModel,
  });

  // Patch the PVC to add owner reference to the Job (so it gets deleted when Job is deleted)
  if (job.metadata?.uid) {
    await addOwnerReference(PersistentVolumeClaimModel, jobName, namespace, {
      apiVersion: 'batch/v1',
      kind: 'Job',
      name: jobName,
      uid: job.metadata.uid,
    });
  }

  return job;
};

/**
 * Reruns a self-validation checkup by creating new job with same specs
 * Only deletes currently running jobs, preserves completed/failed jobs for history
 * @param configMap - The tracking ConfigMap for the checkup
 * @param jobs - Array of existing jobs for this checkup
 * @param checkupImage - Optional new image to use (defaults to image from latest job)
 * @returns The newly created Job resource
 */
export const rerunSelfValidationCheckup = async (
  configMap: IoK8sApiCoreV1ConfigMap,
  jobs: IoK8sApiBatchV1Job[],
  checkupImage: string,
): Promise<IoK8sApiBatchV1Job> => {
  const { name, namespace } = configMap.metadata;

  // Extract specs from ConfigMap (preferred) or fall back to the latest job
  const testSuitesFromConfigMap = configMap?.data?.[SELF_VALIDATION_TEST_SUITES_KEY]?.split(',')
    .map((suite) => suite.trim())
    .filter(Boolean);
  const isDryRunFromConfigMap = configMap?.data?.[SELF_VALIDATION_DRY_RUN_KEY] === 'true';
  const imageFromConfigMap = configMap?.data?.[SELF_VALIDATION_CHECKUP_IMAGE_KEY];
  const storageClassFromConfigMap = configMap?.data?.[SELF_VALIDATION_STORAGE_CLASS_KEY];
  const testSkipsFromConfigMap = configMap?.data?.[SELF_VALIDATION_TEST_SKIPS_KEY];
  const storageCapabilitiesFromConfigMap = configMap?.data?.[
    SELF_VALIDATION_STORAGE_CAPABILITIES_KEY
  ]?.split(',')
    .map((capability) => capability.trim())
    .filter(Boolean);

  // Get the most recent job as fallback
  const latestJob = jobs?.[0];

  // Try to get configuration from ConfigMap first, fall back to job
  let testSuites: string[];
  let isDryRun: boolean;
  let imageToUse: string;
  let storageClassToUse: string | undefined;
  let testSkipsToUse: string | undefined;
  let storageCapabilitiesToUse: string[] | undefined;

  if (testSuitesFromConfigMap && testSuitesFromConfigMap.length > 0) {
    // ConfigMap has complete configuration
    testSuites = testSuitesFromConfigMap;
    isDryRun = isDryRunFromConfigMap;
    imageToUse = checkupImage || imageFromConfigMap || '';
    storageClassToUse = storageClassFromConfigMap;
    testSkipsToUse = testSkipsFromConfigMap;
    storageCapabilitiesToUse = storageCapabilitiesFromConfigMap;
  } else if (latestJob) {
    // Fall back to job configuration
    testSuites = getTestSuitesFromJob(latestJob);
    isDryRun = getDryRunFromJob(latestJob);
    imageToUse = checkupImage || imageFromConfigMap || getCheckupImageFromJob(latestJob);
    // Extract storage class from job env if available
    const storageClassEnv = latestJob.spec.template.spec.containers[0]?.env?.find(
      (env) => env.name === 'STORAGE_CLASS',
    );
    storageClassToUse = storageClassEnv?.value || storageClassFromConfigMap;
    // Extract test skips from job env if available
    const testSkipsEnv = latestJob.spec.template.spec.containers[0]?.env?.find(
      (env) => env.name === 'TEST_SKIPS',
    );
    testSkipsToUse = testSkipsEnv?.value || testSkipsFromConfigMap;
    // Extract storage capabilities from job env if available
    const storageCapabilitiesEnv = latestJob.spec.template.spec.containers[0]?.env?.find(
      (env) => env.name === 'STORAGE_CAPABILITIES',
    );
    storageCapabilitiesToUse =
      storageCapabilitiesEnv?.value
        ?.split(',')
        .map((capability) => capability.trim())
        .filter(Boolean) || storageCapabilitiesFromConfigMap;
  } else {
    // No configuration available
    throw new Error(
      'No configuration found to rerun. ConfigMap is missing test suites data and no jobs exist.',
    );
  }

  // Validate we have required configuration
  if (!testSuites || testSuites.length === 0) {
    throw new Error('Cannot rerun checkup: no test suites configured');
  }
  if (!imageToUse) {
    throw new Error('Cannot rerun checkup: no checkup image configured');
  }

  // Delete only running jobs (keep completed/failed jobs for history/debugging)
  const runningJobs = jobs.filter((job) => isJobRunning(job));
  const deletionErrors: string[] = [];

  for (const job of runningJobs) {
    try {
      await k8sDelete({
        model: JobModel,
        resource: { metadata: { name: job.metadata.name, namespace } },
      });
      kubevirtConsole.log('Deleted running job:', job.metadata.name);

      // Try to delete the associated PVC (in case owner reference didn't work or wasn't set)
      try {
        await k8sDelete({
          model: PersistentVolumeClaimModel,
          resource: { metadata: { name: job.metadata.name, namespace } },
        });
        kubevirtConsole.log('Deleted PVC for running job:', job.metadata.name);
      } catch (pvcError) {
        kubevirtConsole.warn('Failed to delete PVC (may not exist):', pvcError);
      }
    } catch (error) {
      deletionErrors.push(job.metadata.name);
      kubevirtConsole.error('Failed to delete running job:', error);
    }
  }

  if (deletionErrors.length > 0) {
    throw new Error(
      `Failed to delete running jobs: ${deletionErrors.join(', ')}. Cannot proceed with rerun.`,
    );
  }

  const patchOperations = [];

  if (configMap?.data?.[STATUS_COMPLETION_TIME_STAMP]) {
    patchOperations.push({ op: 'remove', path: `/data/${STATUS_COMPLETION_TIME_STAMP}` });
  }

  patchOperations.push({
    op: 'replace',
    path: `/data/${STATUS_START_TIME_STAMP}`,
    value: new Date().toISOString(),
  });

  if (configMap?.data?.[SELF_VALIDATION_RESULTS_KEY]) {
    patchOperations.push({ op: 'remove', path: `/data/${SELF_VALIDATION_RESULTS_KEY}` });
  }

  try {
    await k8sPatch({
      data: patchOperations,
      model: ConfigMapModel,
      resource: { metadata: { name, namespace } },
    });
  } catch (error) {
    kubevirtConsole.error('Failed to reset initial configmap:', error);
  }

  // Create new Job and PVC
  const jobData = selfValidationJob(
    name,
    namespace,
    imageToUse,
    testSuites,
    isDryRun,
    storageClassToUse,
    testSkipsToUse,
    storageCapabilitiesToUse,
  );
  const jobName = jobData.metadata.name;

  // Create PVC first
  await k8sCreate({
    data: selfValidationPVC(jobName, namespace, storageClassToUse),
    model: PersistentVolumeClaimModel,
  });

  // Create Job and capture its UID
  const job = await k8sCreate<IoK8sApiBatchV1Job>({
    data: jobData,
    model: JobModel,
  });

  // Patch the PVC to add owner reference to the Job (so it gets deleted when Job is deleted)
  if (job.metadata?.uid) {
    await addOwnerReference(PersistentVolumeClaimModel, jobName, namespace, {
      apiVersion: 'batch/v1',
      kind: 'Job',
      name: jobName,
      uid: job.metadata.uid,
    });
  }

  return job;
};

/**
 * Deletes an entire self-validation checkup and all associated resources
 * Cleans up: all jobs, PVCs, result ConfigMaps, nginx resources (Jobs, Services, Routes, ConfigMaps)
 * @param configMap - The tracking ConfigMap for the checkup
 * @param jobs - Array of all jobs for this checkup
 */
export const deleteSelfValidationCheckup = async (
  configMap: IoK8sApiCoreV1ConfigMap,
  jobs: IoK8sApiBatchV1Job[],
): Promise<void> => {
  const { namespace } = configMap.metadata;

  // Delete all resources for each self-validation job
  for (const job of jobs) {
    try {
      const jobName = job.metadata.name;
      kubevirtConsole.log(`Cleaning up resources for job: ${jobName}`);

      // Calculate nginx resource names for this job
      const nginxResources = getNginxResourceNames(jobName);

      // Delete nginx Job (pvc-reader)
      try {
        await k8sDelete({
          model: JobModel,
          resource: { metadata: { name: nginxResources.jobName, namespace } },
        });
        kubevirtConsole.log(`Deleted nginx job: ${nginxResources.jobName}`);
      } catch (error) {
        kubevirtConsole.warn(`Failed to delete nginx job ${nginxResources.jobName}:`, error);
      }

      // Delete nginx Route
      try {
        await k8sDelete({
          model: RouteModel,
          resource: { metadata: { name: nginxResources.routeName, namespace } },
        });
        kubevirtConsole.log(`Deleted route: ${nginxResources.routeName}`);
      } catch (error) {
        kubevirtConsole.warn(`Failed to delete route ${nginxResources.routeName}:`, error);
      }

      // Delete nginx Service
      try {
        await k8sDelete({
          model: ServiceModel,
          resource: { metadata: { name: nginxResources.serviceName, namespace } },
        });
        kubevirtConsole.log(`Deleted service: ${nginxResources.serviceName}`);
      } catch (error) {
        kubevirtConsole.warn(`Failed to delete service ${nginxResources.serviceName}:`, error);
      }

      // Delete nginx ConfigMap
      try {
        await k8sDelete({
          model: ConfigMapModel,
          resource: { metadata: { name: nginxResources.configMapName, namespace } },
        });
        kubevirtConsole.log(`Deleted nginx configmap: ${nginxResources.configMapName}`);
      } catch (error) {
        kubevirtConsole.warn(
          `Failed to delete nginx configmap ${nginxResources.configMapName}:`,
          error,
        );
      }

      // Delete the self-validation job itself
      try {
        await k8sDelete({
          model: JobModel,
          resource: job,
        });
        kubevirtConsole.log(`Deleted self-validation job: ${jobName}`);
      } catch (error) {
        kubevirtConsole.warn(`Failed to delete job ${jobName}:`, error);
      }

      // Delete job's results ConfigMap
      const resultsConfigMapName = getResultsConfigMapName(jobName);
      try {
        await k8sDelete({
          model: ConfigMapModel,
          resource: { metadata: { name: resultsConfigMapName, namespace } },
        });
        kubevirtConsole.log(`Deleted results configmap: ${resultsConfigMapName}`);
      } catch (error) {
        kubevirtConsole.warn(`Failed to delete results ConfigMap ${resultsConfigMapName}:`, error);
      }

      // Delete job's PVC
      try {
        await k8sDelete({
          model: PersistentVolumeClaimModel,
          resource: { metadata: { name: jobName, namespace } },
        });
        kubevirtConsole.log(`Deleted PVC: ${jobName}`);
      } catch (error) {
        kubevirtConsole.warn(`Failed to delete PVC ${jobName}:`, error);
      }
    } catch (error) {
      kubevirtConsole.error('Failed to delete job resources:', error);
    }
  }

  // Finally, delete the tracking ConfigMap
  try {
    await k8sDelete({
      model: ConfigMapModel,
      resource: configMap,
    });
    kubevirtConsole.log(`Deleted tracking configmap: ${configMap.metadata.name}`);
  } catch (error) {
    kubevirtConsole.error('Failed to delete tracking configmap:', error);
  }
};

/**
 * Deletes a single self-validation job and its associated resources
 * Cleans up: job, result ConfigMap, and PVC
 * @param job - The job to delete
 */
export const deleteSelfValidationJob = async (job: IoK8sApiBatchV1Job): Promise<void> => {
  try {
    const jobName = job.metadata.name;
    const namespace = job.metadata.namespace;

    // Delete the job
    await k8sDelete({
      model: JobModel,
      resource: job,
    });

    // Delete the job's results ConfigMap
    const resultsConfigMapName = getResultsConfigMapName(jobName);
    try {
      await k8sDelete({
        model: ConfigMapModel,
        resource: {
          metadata: {
            name: resultsConfigMapName,
            namespace,
          },
        },
      });
    } catch (error) {
      kubevirtConsole.warn('Failed to delete results ConfigMap:', error);
    }

    // Delete the job's PVC
    try {
      await k8sDelete({
        model: PersistentVolumeClaimModel,
        resource: {
          metadata: {
            name: jobName,
            namespace,
          },
        },
      });
    } catch (error) {
      kubevirtConsole.warn('Failed to delete PVC:', error);
    }
  } catch (error) {
    kubevirtConsole.error('Failed to delete job:', error);
  }
};

// ===========================
// RBAC Management
// ===========================

export const installSelfValidationPermissions = async (namespace: string): Promise<void> => {
  await installPermissions(namespace);
};

export const removeSelfValidationPermissions = async (namespace: string): Promise<void> => {
  await uninstallPermissions(namespace);
};
