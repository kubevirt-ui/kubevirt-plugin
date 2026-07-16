import { useMemo } from 'react';

import { SubscriptionModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type DeschedulerStatus,
  useDeschedulerInstalled,
} from '@kubevirt-utils/hooks/useDeschedulerInstalled';
import { getDeschedulerStatus } from '@kubevirt-utils/hooks/useDeschedulerStatus/utils';
import {
  DESCHEDULER_OPERATOR_NAME,
  KUBE_DESCHEDULER_NAMESPACE,
} from '@kubevirt-utils/resources/descheduler/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { type SubscriptionKind } from '@overview/utils/types';

type UseDeschedulerStatusResult = {
  loaded: boolean;
  status: DeschedulerStatus;
};

/**
 * Resolves descheduler status for overview and cluster widgets.
 * Uses KubeDescheduler CR presence for enabled state and operator subscription for install state.
 * @param cluster
 */
export const useDeschedulerStatus = (cluster?: string): UseDeschedulerStatusResult => {
  const clusterParam = useClusterParam();
  const resolvedCluster = cluster ?? clusterParam;

  const { isDeschedulerInstalled, loaded: crLoaded } = useDeschedulerInstalled(resolvedCluster);
  const [subscription, subscriptionLoaded, subscriptionError] = useK8sWatchData<SubscriptionKind>({
    cluster: resolvedCluster,
    groupVersionKind: SubscriptionModelGroupVersionKind,
    isList: false,
    name: DESCHEDULER_OPERATOR_NAME,
    namespace: KUBE_DESCHEDULER_NAMESPACE,
  });

  const subscriptionResolved = subscriptionLoaded || !isEmpty(subscriptionError);
  const loaded = crLoaded && subscriptionResolved;
  const status = useMemo(
    () =>
      getDeschedulerStatus({
        hasSubscription: !!subscription,
        isDeschedulerInstalled,
        loaded,
      }),
    [loaded, subscription, isDeschedulerInstalled],
  );

  return { loaded, status };
};
