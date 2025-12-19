import {
  useK8sWatchResources,
  WatchK8sResource,
  WatchK8sResources,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  FleetResourcesObject,
  FleetWatchK8sResource,
  FleetWatchK8sResources,
  FleetWatchK8sResults,
  useFleetK8sWatchResources,
  useHubClusterName,
} from '@stolostron/multicluster-sdk';

const useKubevirtWatchResources = <R extends FleetResourcesObject>(
  resources: FleetWatchK8sResources<R>,
): FleetWatchK8sResults<R> => {
  const [hubClusterName] = useHubClusterName();

  const useFleet = Object.values(resources).some(
    (resource: FleetWatchK8sResource | WatchK8sResource) =>
      'cluster' in resource && resource?.cluster && resource?.cluster !== hubClusterName,
  );

  const fleetData = useFleetK8sWatchResources(
    (useFleet ? resources : {}) as FleetWatchK8sResources<R>,
  );
  const k8sData = useK8sWatchResources((useFleet ? {} : resources) as WatchK8sResources<R>);

  return useFleet ? fleetData : k8sData;
};

export default useKubevirtWatchResources;
