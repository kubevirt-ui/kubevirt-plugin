import { useMemo } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useK8sWatchResource, WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';
import {
  FleetWatchK8sResource,
  useFleetK8sWatchResource,
  useHubClusterName,
} from '@stolostron/multicluster-sdk';

const useK8sWatchData = <T>(resource: FleetWatchK8sResource | null): WatchK8sResult<T> => {
  const [hubClusterName, hubClusterNameLoaded, hubClusterError] = useHubClusterName();
  const isACMPage = useIsACMPage();

  // multicluster sdk doesn't support limit as console sdk does
  const requestWithNoLimit = resource ? { ...resource, limit: undefined } : null;

  const waitingForHubName =
    isACMPage && !!resource?.cluster && !hubClusterNameLoaded && !hubClusterError;
  const useFleet = resource?.cluster && resource?.cluster !== hubClusterName;

  const [fleetData, fleetLoaded, fleetError] = useFleetK8sWatchResource<T>(
    useFleet && !waitingForHubName ? requestWithNoLimit : null,
  );

  const [k8sWatchData, k8sWatchLoaded, k8sWatchError] = useK8sWatchResource<T>(
    !useFleet ? resource : null,
  );

  const defaultData: T = useMemo(
    () => (resource?.isList ? ([] as T) : undefined),
    [resource?.isList],
  );

  if (!resource || isEmpty(resource) || isEmpty(resource?.groupVersionKind))
    return [undefined, true, undefined];

  if (waitingForHubName) return [defaultData, false, undefined];

  return useFleet
    ? [isEmpty(fleetData) ? defaultData : fleetData, fleetLoaded, fleetError]
    : [isEmpty(k8sWatchData) ? defaultData : k8sWatchData, k8sWatchLoaded, k8sWatchError];
};

export default useK8sWatchData;
