import * as React from 'react';
import * as _ from 'lodash';

import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import ClusterServiceVersionModel from '@kubevirt-ui/kubevirt-api/console/models/ClusterServiceVersionModel';
import SubscriptionModel from '@kubevirt-ui/kubevirt-api/console/models/SubscriptionModel';
import { K8sResourceCommon, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { useDeepCompareMemoize } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useDeepCompareMemoize';

import { useDebounceCallback } from '../../../utils/hooks/useDebounceCallback';
import { LSO_NAME, ODF_OPERATOR_NAME } from '../constants';
import { ClusterServiceVersionKind } from '../types';

const watchedResources = {
  installedCSVs: {
    groupVersionKind: modelToGroupVersionKind(ClusterServiceVersionModel),
    namespaced: true,
    isList: true,
  },
  subscriptions: {
    groupVersionKind: modelToGroupVersionKind(SubscriptionModel),
    namespaced: false,
    isList: true,
  },
};

const getSubscriptionForOperator = (subscriptions, operatorName) => {
  return _.find(subscriptions, (sub) => sub?.metadata?.name === operatorName);
};

const getCSVForInstalledVersion = (
  clusterServiceVersions,
  installedCSV,
): ClusterServiceVersionKind => {
  return _.find(clusterServiceVersions, (csv) => csv?.metadata?.name === installedCSV);
};

const useKubevirtStorageOperatorCSVs = () => {
  const [csvsLoaded, setCSVsLoaded] = React.useState<boolean>(false);
  const [csvsLoadError, setCSVsLoadError] = React.useState<string>(null);
  const [lsoCSV, setCSVForLSO] = React.useState(null);
  const [odfCSV, setCSVForODF] = React.useState(null);
  const resources = useK8sWatchResources<{ [key: string]: K8sResourceCommon[] }>(watchedResources);

  const updateResults = (updatedResources) => {
    const subsResult = updatedResources?.subscriptions;
    const csvsResult = updatedResources?.installedCSVs;
    setCSVsLoaded(csvsResult?.loaded);
    setCSVsLoadError(csvsResult?.loadError);

    if (Object.keys(updatedResources).length > 0) {
      const lsoSub = getSubscriptionForOperator(subsResult?.data, LSO_NAME);
      const lso = lsoSub
        ? getCSVForInstalledVersion(csvsResult?.data, lsoSub?.status?.installedCSV)
        : null;
      setCSVForLSO(lso);

      const odfSub = getSubscriptionForOperator(subsResult?.data, ODF_OPERATOR_NAME);
      const odf = odfSub
        ? getCSVForInstalledVersion(csvsResult?.data, odfSub?.status?.installedCSV)
        : null;
      setCSVForODF(odf);
    }
  };
  const debouncedUpdateResources = useDebounceCallback(updateResults, 50);

  React.useEffect(() => {
    debouncedUpdateResources(resources);
  }, [debouncedUpdateResources, resources]);

  return useDeepCompareMemoize({
    lsoCSV,
    odfCSV,
    loaded: csvsLoaded,
    loadError: csvsLoadError,
  });
};

export default useKubevirtStorageOperatorCSVs;
