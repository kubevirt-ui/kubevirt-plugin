import { BASE_K8S_API_PATH } from '@multicluster/constants';
import { useFleetK8sAPIPath } from '@stolostron/multicluster-sdk';

const useK8sBaseAPIPath = (cluster?: string): [string, boolean] => {
  const [apiPath, apiPathLoaded] = useFleetK8sAPIPath(cluster);

  if (!cluster) return [BASE_K8S_API_PATH, true];

  return [apiPath, apiPathLoaded];
};

export default useK8sBaseAPIPath;
