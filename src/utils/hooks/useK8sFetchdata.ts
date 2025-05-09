import { useParams } from 'react-router-dom-v5-compat';

import { useK8sWatchResource, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetK8sWatchResource } from '@stolostron/multicluster-sdk';

const useK8sFetchData = (resource: null | WatchK8sResource) => {
  const params = useParams();
  const { cluster } = params;

  const fleetWatchResult = useFleetK8sWatchResource(cluster ? resource : null);

  const k8sWatchResult = useK8sWatchResource(cluster ? null : resource);

  return cluster ? fleetWatchResult : k8sWatchResult;
};

export default useK8sFetchData;
