// Extracted from resourceTemplates.ts
// Root: src/views/checkups/self-validation/utils/selfValidationJob/resourceTemplates.ts

import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

import { SELF_VALIDATION_LABEL_VALUE, TEST_SUITE_TIER2 } from '../constants';

import { KUBEVIRT_VM_LATENCY_LABEL } from '../../../utils/utils';
import {
  CDI_APPLY_STORAGE_PROFILE_LABEL,
  PVC_ACCESS_MODE,
  PVC_STORAGE_SIZE,
  PVC_STORAGE_SIZE_PER_SUITE,
  PVC_STORAGE_SIZE_TIER2,
} from './constants';

export const calculatePVCStorageSize = (selectedTestSuites: string[]): string => {
  if (!selectedTestSuites || selectedTestSuites.length === 0) {
    return PVC_STORAGE_SIZE;
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
): IoK8sApiCoreV1PersistentVolumeClaim => ({
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
    ...(storageClass ? { storageClassName: storageClass } : {}),
  },
});
