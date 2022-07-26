import { KubeDeschedulerModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

/**
 * A Hook that checks if Kube Descheduler operator is installed.
 * @returns {boolean} boolean value
 */

// check if the Descheduler is installed
export const useDeschedulerInstalled = (): boolean => {
  const [resourceList] = useK8sWatchResource<any>({
    groupVersionKind: KubeDeschedulerModelGroupVersionKind,
    isList: false,
  });

  return !isEmpty(resourceList);
};
