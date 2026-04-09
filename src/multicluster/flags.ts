import { useEffect } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { SetFeatureFlag } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import { FLAG_DISALLOWED_KUBEVIRT_DYNAMIC_ACM, FLAG_KUBEVIRT_DYNAMIC_ACM } from './constants';

export const useKubevirtDynamicACMFlag = (setFeatureFlag: SetFeatureFlag) => {
  const [hubClusterName, hubClusterNameLoaded, hubClusterError] = useHubClusterName();
  useKubevirtTranslation();

  const isFleetAvailable = !isEmpty(hubClusterName) && !hubClusterError;
  const isLoading = !hubClusterNameLoaded && !hubClusterError;

  useEffect(() => {
    if (!isLoading) return;
    setFeatureFlag(FLAG_KUBEVIRT_DYNAMIC_ACM, isFleetAvailable);
    setFeatureFlag(FLAG_DISALLOWED_KUBEVIRT_DYNAMIC_ACM, !isFleetAvailable);
  }, [isFleetAvailable, isLoading, setFeatureFlag]);
};
