import { BASE_K8S_API_PATH, FLEET_SPOKE_PROXY_BASE_PATH } from '@multicluster/constants';
import { useFleetK8sAPIPath } from '@stolostron/multicluster-sdk';

const useK8sBaseAPIPath = (cluster?: string): [string, boolean] => {
  const [apiPath, apiPathLoaded, apiPathError] = useFleetK8sAPIPath(cluster);

  if (!cluster) return [BASE_K8S_API_PATH, true];

  // When the fleet SDK is unavailable (e.g. RHACM not yet initialised in a
  // standalone window), fall back to constructing the spoke-cluster proxy path
  // directly so the VNC console is not permanently blocked.
  if (!apiPathLoaded && apiPathError) {
    return [`${FLEET_SPOKE_PROXY_BASE_PATH}/${cluster}`, true];
  }

  return [apiPath, apiPathLoaded];
};

export default useK8sBaseAPIPath;
