import { useMemo } from 'react';

import { SubscriptionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/SubscriptionModel';
import { KUBEVIRT_HYPERCONVERGED } from '@kubevirt-utils/constants/constants';
import { ClusterServiceVersionModelGroupVersionKind } from '@kubevirt-utils/models';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { ClusterServiceVersionKind, SubscriptionKind } from '@overview/utils/types';

type UseKubevirtClusterServiceVersion = (cluster?: string) => {
  installedCSV: ClusterServiceVersionKind;
  loaded: boolean;
  loadErrors: Error;
  subscription: SubscriptionKind;
};

export const useKubevirtClusterServiceVersion: UseKubevirtClusterServiceVersion = (cluster) => {
  const operatorNamespace = operatorNamespaceSignal.value;

  const [subscriptions, _loadedSubscription, loadSubscriptionError] = useK8sWatchData<
    SubscriptionKind[]
  >(
    operatorNamespace && {
      cluster,
      groupVersionKind: SubscriptionModelGroupVersionKind,
      isList: true,
      namespace: operatorNamespace,
    },
  );

  const loadedSubscription = _loadedSubscription && !isEmpty(operatorNamespace);

  const subscription = useMemo(
    () => subscriptions?.find((sub) => sub?.spec?.name?.endsWith(KUBEVIRT_HYPERCONVERGED)),
    [subscriptions],
  );

  const [installedCSV, loadedCSV, loadCSVError] = useK8sWatchData<ClusterServiceVersionKind>(
    subscription && {
      cluster,
      groupVersionKind: ClusterServiceVersionModelGroupVersionKind,
      name: subscription?.status?.installedCSV,
      namespace: subscription?.metadata?.namespace,
    },
  );
  const loadErrors = loadSubscriptionError || loadCSVError;

  const loaded = loadedSubscription && loadedCSV;
  return { installedCSV, loaded, loadErrors, subscription };
};
