import { KubeDeschedulerModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  DESCHEDULER_ENABLED,
  DESCHEDULER_NOT_ENABLED,
  DESCHEDULER_NOT_INSTALLED,
  DESCHEDULER_UNKNOWN,
} from '@kubevirt-utils/hooks/constants';
import {
  KUBE_DESCHEDULER_NAME,
  KUBE_DESCHEDULER_NAMESPACE,
} from '@kubevirt-utils/resources/descheduler/constants';
import { KubeDescheduler } from '@kubevirt-utils/resources/descheduler/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

export type DeschedulerStatus =
  | typeof DESCHEDULER_ENABLED
  | typeof DESCHEDULER_NOT_ENABLED
  | typeof DESCHEDULER_NOT_INSTALLED
  | typeof DESCHEDULER_UNKNOWN;

type UseDeschedulerInstalledResult = {
  isDeschedulerInstalled: boolean;
  loaded: boolean;
  status: DeschedulerStatus;
};

const getDeschedulerStatus = (installed: boolean, loaded: boolean): DeschedulerStatus => {
  if (!loaded) return DESCHEDULER_UNKNOWN;
  return installed ? DESCHEDULER_ENABLED : DESCHEDULER_NOT_INSTALLED;
};

/**
 * A Hook that checks if Kube Descheduler operator is installed.
 * @param cluster descheduler cluster
 * @returns installed boolean, loaded flag, and a status string
 */
export const useDeschedulerInstalled = (cluster?: string): UseDeschedulerInstalledResult => {
  const clusterParam = useClusterParam();
  const [resource, loaded] = useK8sWatchData<KubeDescheduler>({
    cluster: cluster || clusterParam,
    groupVersionKind: KubeDeschedulerModelGroupVersionKind,
    isList: false,
    name: KUBE_DESCHEDULER_NAME,
    namespace: KUBE_DESCHEDULER_NAMESPACE,
  });

  const isDeschedulerInstalled = !isEmpty(resource);
  return {
    isDeschedulerInstalled,
    loaded,
    status: getDeschedulerStatus(isDeschedulerInstalled, loaded),
  };
};
