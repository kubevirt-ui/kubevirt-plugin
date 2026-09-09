import { useEffect, useRef } from 'react';

import { logMultiClusterManagementDetected } from '@kubevirt-utils/extensions/telemetry/multicluster';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type SetFeatureFlag } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetClusterNames, useHubClusterName } from '@stolostron/multicluster-sdk';

import { FLAG_DISALLOWED_KUBEVIRT_DYNAMIC_ACM, FLAG_KUBEVIRT_DYNAMIC_ACM } from './constants';

export const useKubevirtDynamicACMFlag = (setFeatureFlag: SetFeatureFlag): void => {
  const [hubClusterName, hubClusterNameLoaded, hubClusterError] = useHubClusterName() as [
    string | undefined,
    boolean,
    Error | undefined,
  ];
  const [clusterNames, clustersLoaded] = useFleetClusterNames();
  const hasLoggedMultiClusterRef = useRef(false);

  const isFleetAvailable = !isEmpty(hubClusterName) && !hubClusterError;
  const isLoading = !hubClusterNameLoaded && !hubClusterError;

  useEffect(() => {
    if (isLoading) return;
    setFeatureFlag(FLAG_KUBEVIRT_DYNAMIC_ACM, isFleetAvailable);
    setFeatureFlag(FLAG_DISALLOWED_KUBEVIRT_DYNAMIC_ACM, !isFleetAvailable);
  }, [isFleetAvailable, isLoading, setFeatureFlag]);

  useEffect(() => {
    if (isLoading || hasLoggedMultiClusterRef.current) return;
    if (isFleetAvailable && !clustersLoaded) return;

    hasLoggedMultiClusterRef.current = true;
    logMultiClusterManagementDetected(
      isFleetAvailable,
      isFleetAvailable ? clusterNames?.length : undefined,
    );
  }, [clusterNames, clustersLoaded, isFleetAvailable, isLoading]);
};
