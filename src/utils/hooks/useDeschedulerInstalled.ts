import { KubeDeschedulerModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

/**
 * A Hook that checks if Kube Descheduler operator is installed.
 * @returns {boolean} boolean value
 */

// check if the Descheduler is installed
export const useDeschedulerInstalled = (cluster?: string): boolean => {
  const clusterParam = useClusterParam();
  const [resourceList] = useK8sWatchData<any>({
    cluster: cluster || clusterParam,
    groupVersionKind: KubeDeschedulerModelGroupVersionKind,
    isList: false,
  });

  return !isEmpty(resourceList);
};
