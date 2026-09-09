import type { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

export type UseFeaturesValues = {
  canEdit: boolean;
  error: Error;
  featureEnabled: boolean;
  loading: boolean;
  toggleFeature: (val: boolean | string) => Promise<IoK8sApiCoreV1ConfigMap>;
};
