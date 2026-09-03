// Extracted from resourceTemplates.ts
// Root: src/views/checkups/self-validation/utils/selfValidationJob/resourceTemplates.ts

import { type IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

import {
  SELF_VALIDATION_ACCEPT_WINDOWS_EULA_KEY,
  SELF_VALIDATION_CHECKUP_IMAGE_KEY,
  SELF_VALIDATION_DRY_RUN_KEY,
  SELF_VALIDATION_LABEL_VALUE,
  SELF_VALIDATION_PVC_SIZE_KEY,
  SELF_VALIDATION_STORAGE_CAPABILITIES_KEY,
  SELF_VALIDATION_STORAGE_CLASS_KEY,
  SELF_VALIDATION_TEST_SKIPS_KEY,
  SELF_VALIDATION_TEST_SUITES_KEY,
  SELF_VALIDATION_WIN_IMAGE_DOWNLOAD_URL_KEY,
} from '../constants';

import { KUBEVIRT_VM_LATENCY_LABEL, STATUS_START_TIME_STAMP } from '../../../utils/utils';

export type SelfValidationConfigMapOptions = {
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
};

export const selfValidationConfigMap = ({
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
}: SelfValidationConfigMapOptions): IoK8sApiCoreV1ConfigMap => ({
  apiVersion: 'v1',
  data: {
    [SELF_VALIDATION_CHECKUP_IMAGE_KEY]: checkupImage,
    [SELF_VALIDATION_DRY_RUN_KEY]: isDryRun.toString(),
    [SELF_VALIDATION_PVC_SIZE_KEY]: pvcSize,
    [SELF_VALIDATION_TEST_SUITES_KEY]: selectedTestSuites.join(','),
    [STATUS_START_TIME_STAMP]: new Date().toISOString(),
    ...(acceptWindowsEula
      ? { [SELF_VALIDATION_ACCEPT_WINDOWS_EULA_KEY]: acceptWindowsEula.toString() }
      : {}),
    ...(storageClass ? { [SELF_VALIDATION_STORAGE_CLASS_KEY]: storageClass } : {}),
    ...(testSkips ? { [SELF_VALIDATION_TEST_SKIPS_KEY]: testSkips } : {}),
    ...(storageCapabilities && storageCapabilities.length > 0
      ? { [SELF_VALIDATION_STORAGE_CAPABILITIES_KEY]: storageCapabilities.join(',') }
      : {}),
    ...(acceptWindowsEula && winImageDownloadUrl
      ? { [SELF_VALIDATION_WIN_IMAGE_DOWNLOAD_URL_KEY]: winImageDownloadUrl }
      : {}),
  },
  kind: 'ConfigMap',
  metadata: {
    labels: { [KUBEVIRT_VM_LATENCY_LABEL]: SELF_VALIDATION_LABEL_VALUE },
    name,
    namespace,
  },
});
