// Extracted from resourceTemplates.ts
// Root: src/views/checkups/self-validation/utils/selfValidationJob/resourceTemplates.ts

import { type IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

import {
  JOB_RESULTS_DIR_PATH,
  JOB_VOLUME_RESULTS,
  SELF_VALIDATION_LABEL_VALUE,
  SELF_VALIDATION_RESULTS_ONLY_LABEL,
  SELF_VALIDATION_SA,
} from '../constants';

import { generateWithNumbers, KUBEVIRT_VM_LATENCY_LABEL } from '../../../utils/utils';
import {
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
} from './constants';
import { buildSelfValidationJobEnvVars } from './jobEnvVars';
import { type SelfValidationJobOptions } from './jobTemplateTypes';

export type { SelfValidationJobOptions } from './jobTemplateTypes';

export const selfValidationJob = (options: SelfValidationJobOptions): IoK8sApiBatchV1Job => {
  const { checkupImage, createResultsResources, jobNameOverride, name, namespace, pvcName } =
    options;
  const jobName = jobNameOverride ?? generateWithNumbers(name);
  const configMapName = createResultsResources && jobNameOverride ? jobName : `${jobName}-results`;
  const envVars = buildSelfValidationJobEnvVars({ ...options, configMapName });

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
                claimName: pvcName ?? jobName,
              },
            },
          ],
        },
      },
    },
  };
};
