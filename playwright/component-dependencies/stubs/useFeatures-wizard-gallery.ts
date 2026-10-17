import type { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import type { WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

import type { UseFeaturesValues } from '@kubevirt-utils/hooks/useFeatures/types';

export const useFeatures = (_featureName: string): UseFeaturesValues => ({
  canEdit: true,
  error: null,
  featureEnabled: true,
  loading: false,
  toggleFeature: async (): Promise<IoK8sApiCoreV1ConfigMap> => ({}) as IoK8sApiCoreV1ConfigMap,
});

const useFeaturesConfigMap = (): {
  featuresConfigMapData: WatchK8sResult<IoK8sApiCoreV1ConfigMap>;
  isAdmin: boolean;
} => ({
  featuresConfigMapData: [{}, true, null],
  isAdmin: true,
});

export default useFeaturesConfigMap;
