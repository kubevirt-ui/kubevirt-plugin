import { useParams } from 'react-router-dom-v5-compat';

import { useK8sWatchResource, WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';
import { FleetWatchK8sResource, useFleetK8sWatchResource } from '@stolostron/multicluster-sdk';

const useK8sFetchData = <T>(resource: FleetWatchK8sResource | null): WatchK8sResult<T> => {
  const params = useParams();
  const { cluster } = params;

  const [fleetData, fleetLoaded, fleetError] = useFleetK8sWatchResource<T>(
    cluster ? resource : null,
  );

  const fleetDataReturn = !resource.isList && Array.isArray(fleetData) ? fleetData[0] : fleetData;

  const k8sWatchResult = useK8sWatchResource<T>(cluster ? null : resource);

  return cluster ? [fleetDataReturn, fleetLoaded, fleetError] : k8sWatchResult;
};

export default useK8sFetchData;
