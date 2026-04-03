import { useEffect } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { SetFeatureFlag } from '@openshift-console/dynamic-plugin-sdk';
import { useIsFleetAvailable } from '@stolostron/multicluster-sdk';

import { FLAG_KUBEVIRT_DISALLOW_DYNAMIC_ACM, FLAG_KUBEVIRT_DYNAMIC_ACM } from './constants';

export const useKubevirtDynamicACMFlag = (setFeatureFlag: SetFeatureFlag) => {
  const isFleetAvailable = useIsFleetAvailable();

  useKubevirtTranslation();

  useEffect(() => {
    if (typeof isFleetAvailable !== 'boolean') return;
    setFeatureFlag(FLAG_KUBEVIRT_DYNAMIC_ACM, isFleetAvailable);
    setFeatureFlag(FLAG_KUBEVIRT_DISALLOW_DYNAMIC_ACM, !isFleetAvailable);
  }, [isFleetAvailable, setFeatureFlag]);
};
