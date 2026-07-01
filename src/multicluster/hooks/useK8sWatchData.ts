import { useMemo } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import useIsACMPage from '@multicluster/useIsACMPage';
import { enrichFleetData } from '@multicluster/utils';
import { useK8sWatchResource, type WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';
import {
  type FleetWatchK8sResource,
  type FleetWatchK8sResult,
  useFleetK8sWatchResource,
  useHubClusterName,
} from '@stolostron/multicluster-sdk';

type ReplaceLastAny<T extends readonly unknown[], L> = T extends readonly [...infer Rest, unknown]
  ? [...Rest, L]
  : never;

type WatchK8sResultWithError<T> = ReplaceLastAny<WatchK8sResult<T>, Error>;
type FleetWatchK8sResultWithError<T> = ReplaceLastAny<FleetWatchK8sResult<T>, Error>;

const useK8sWatchData = <T>(resource: FleetWatchK8sResource | null): WatchK8sResultWithError<T> => {
  const [hubClusterName, hubClusterNameLoaded, hubClusterError] =
    useHubClusterName() as WatchK8sResultWithError<string>;
  const isACMPage = useIsACMPage();

  // multicluster sdk doesn't support limit as console sdk does
  const requestWithNoLimit = resource ? { ...resource, limit: undefined } : null;

  const waitingForHubName =
    isACMPage && !!resource?.cluster && !hubClusterNameLoaded && !hubClusterError;
  const useFleet = resource?.cluster && resource?.cluster !== hubClusterName;

  const [fleetData, fleetLoaded, fleetError] = useFleetK8sWatchResource<T>(
    useFleet && !waitingForHubName ? requestWithNoLimit : null,
  ) as FleetWatchK8sResultWithError<T>;

  const normalizedFleetData = useMemo(
    () => enrichFleetData(fleetData, resource?.groupVersionKind),
    [fleetData, resource?.groupVersionKind],
  );

  const [k8sWatchData, k8sWatchLoaded, k8sWatchError] = useK8sWatchResource<T>(
    !useFleet ? resource : null,
  ) as WatchK8sResultWithError<T>;

  const defaultData: T = useMemo(
    () => (resource?.isList ? ([] as T) : undefined),
    [resource?.isList],
  );

  if (!resource || isEmpty(resource) || isEmpty(resource?.groupVersionKind))
    return [undefined, true, undefined];

  if (waitingForHubName) return [defaultData, false, undefined];

  return useFleet
    ? [isEmpty(normalizedFleetData) ? defaultData : normalizedFleetData, fleetLoaded, fleetError]
    : [isEmpty(k8sWatchData) ? defaultData : k8sWatchData, k8sWatchLoaded, k8sWatchError];
};

export default useK8sWatchData;
