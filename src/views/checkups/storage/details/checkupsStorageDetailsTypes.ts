// Extracted from CheckupsStorageDetailsPageSection.tsx
// Root: src/views/checkups/storage/details/CheckupsStorageDetailsPageSection.tsx

import {
  type IoK8sApiBatchV1Job,
  type IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

export type CheckupsStorageDetailsListsProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
  job: IoK8sApiBatchV1Job;
};
