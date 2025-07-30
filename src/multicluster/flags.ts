import { useEffect } from 'react';

import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { SetFeatureFlag } from '@openshift-console/dynamic-plugin-sdk';

import { FEATURE_KUBEVIRT_ACM_TREEVIEW, FLAG_KUBEVIRT_DYNAMIC_ACM } from './constants';

export const useKubevirtDynamicACMFlag = (setFeatureFlag: SetFeatureFlag) => {
  const { error, featureEnabled, loading } = useFeatures(FEATURE_KUBEVIRT_ACM_TREEVIEW);

  useEffect(() => {
    if (!loading && !error) {
      setFeatureFlag(FLAG_KUBEVIRT_DYNAMIC_ACM, featureEnabled);
    }
  }, [error, loading, featureEnabled, setFeatureFlag]);
};
