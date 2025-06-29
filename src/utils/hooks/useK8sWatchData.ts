import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource, WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';
import { FleetWatchK8sResource, useFleetK8sWatchResource } from '@stolostron/multicluster-sdk';

const useK8sWatchData = <T>(resource: FleetWatchK8sResource | null): WatchK8sResult<T> => {
  const cluster = resource.cluster;

  const [fleetData, fleetLoaded, fleetError] = useFleetK8sWatchResource<T>(
    cluster ? resource : null,
  );

  const [k8sWatchData, k8sWatchLoaded, k8sWatchError] = useK8sWatchResource<T>(
    cluster ? null : resource,
  );

  if (!resource || isEmpty(resource) || isEmpty(resource?.groupVersionKind))
    return [undefined, true, undefined];

  return cluster
    ? [fleetData, fleetLoaded, fleetError]
    : [k8sWatchData, k8sWatchLoaded, k8sWatchError];
};

export default useK8sWatchData;
