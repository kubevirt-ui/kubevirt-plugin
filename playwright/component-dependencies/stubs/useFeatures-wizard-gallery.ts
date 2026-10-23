/**
 * Gallery aliases for `useFeatures` / `useFeaturesConfigMap`.
 * All feature flags read as enabled; no console feature ConfigMap watch.
 */
import type { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import type { WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

import type { UseFeaturesValues } from '@kubevirt-utils/hooks/useFeatures/types';

/** Returns enabled feature state for any feature name in gallery scenes. */
export const useFeatures = (_featureName: string): UseFeaturesValues => ({
  canEdit: true,
  error: null,
  featureEnabled: true,
  loading: false,
  toggleFeature: async (): Promise<IoK8sApiCoreV1ConfigMap> => ({}) as IoK8sApiCoreV1ConfigMap,
});

/** Admin user with an empty features ConfigMap watch result. */
const useFeaturesConfigMap = (): {
  featuresConfigMapData: WatchK8sResult<IoK8sApiCoreV1ConfigMap>;
  isAdmin: boolean;
} => ({
  featuresConfigMapData: [{}, true, null],
  isAdmin: true,
});

export default useFeaturesConfigMap;
