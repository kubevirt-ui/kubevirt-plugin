// Extracted from jobLifecycle.ts
// Root: src/views/checkups/self-validation/utils/selfValidationJob/jobLifecycle.ts

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import { selfValidationConfigMap } from './configMapTemplate';
import { createJobWithPVC } from './createJobWithPVC';
import { type WarningCallback } from './helpers';
import { selfValidationJob } from './jobTemplate';

export type CreateSelfValidationCheckupOptions = {
  acceptWindowsEula?: boolean;
  checkupImage: string;
  cluster: string;
  isDryRun: boolean;
  name: string;
  namespace: string;
  onWarning?: WarningCallback;
  pvcSize: string;
  selectedTestSuites: string[];
  storageCapabilities?: string[];
  storageClass?: string;
  testSkips?: string;
  winImageDownloadUrl?: string;
};

export const createSelfValidationCheckup = async ({
  acceptWindowsEula,
  checkupImage,
  cluster,
  isDryRun,
  name,
  namespace,
  onWarning,
  pvcSize,
  selectedTestSuites,
  storageCapabilities,
  storageClass,
  testSkips,
  winImageDownloadUrl,
}: CreateSelfValidationCheckupOptions): Promise<IoK8sApiBatchV1Job> => {
  const jobData = selfValidationJob({
    acceptWindowsEula,
    checkupImage,
    isDryRun,
    name,
    namespace,
    selectedTestSuites,
    storageCapabilities,
    storageClass,
    testSkips,
    winImageDownloadUrl,
  });

  await kubevirtK8sCreate({
    cluster,
    data: selfValidationConfigMap({
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
    }),
    model: ConfigMapModel,
  });

  return createJobWithPVC(jobData, cluster, namespace, pvcSize, storageClass, onWarning);
};
