import { useMemo } from 'react';

import { useK8sWatchResource, WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';
import { FleetWatchK8sResource, useFleetK8sWatchResource } from '@stolostron/multicluster-sdk';

const useK8sWatchData = <T>(resource: FleetWatchK8sResource | null): WatchK8sResult<T> => {
  const cluster = resource.cluster;

  const [fleetData, fleetLoaded, fleetError] = useFleetK8sWatchResource<T>(
    cluster ? resource : null,
  );

  const k8sWatchResult = useK8sWatchResource<T>(cluster ? null : resource);

  return useMemo(
    () => (cluster ? [fleetData, fleetLoaded, fleetError] : k8sWatchResult),
    [cluster, fleetData, fleetError, fleetLoaded, k8sWatchResult],
  );
};

export default useK8sWatchData;
