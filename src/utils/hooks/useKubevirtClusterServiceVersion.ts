import { useMemo } from 'react';

import { SubscriptionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/SubscriptionModel';
import { KUBEVIRT_HYPERCONVERGED } from '@kubevirt-utils/constants/constants';
import { ClusterServiceVersionModelGroupVersionKind } from '@kubevirt-utils/models';
import { DEFAULT_OPERATOR_NAMESPACE } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { ClusterServiceVersionKind, SubscriptionKind } from '@overview/utils/types';

type UseKubevirtClusterServiceVersion = {
  installedCSV: ClusterServiceVersionKind;
  loaded: boolean;
  loadErrors: Error;
  subscription: SubscriptionKind;
};

export const useKubevirtClusterServiceVersion = (): UseKubevirtClusterServiceVersion => {
  const [subscriptions, loadedSubscription, loadSubscriptionError] = useK8sWatchResource<
    SubscriptionKind[]
  >({
    groupVersionKind: SubscriptionModelGroupVersionKind,
    isList: true,
    namespace: DEFAULT_OPERATOR_NAMESPACE,
  });

  const subscription = useMemo(
    () => subscriptions?.find((sub) => sub?.spec?.name.endsWith(KUBEVIRT_HYPERCONVERGED)),
    [subscriptions],
  );

  const [installedCSV, loadedCSV, loadCSVError] = useK8sWatchResource<ClusterServiceVersionKind>(
    subscription && {
      groupVersionKind: ClusterServiceVersionModelGroupVersionKind,
      name: subscription?.status?.installedCSV,
      namespace: subscription?.metadata?.namespace,
    },
  );
  const loadErrors = loadSubscriptionError || loadCSVError;

  const loaded = loadedSubscription && loadedCSV;
  return { installedCSV, loaded, loadErrors, subscription };
};
