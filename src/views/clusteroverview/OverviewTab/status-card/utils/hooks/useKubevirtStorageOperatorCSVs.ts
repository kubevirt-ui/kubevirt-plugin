import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import ClusterServiceVersionModel from '@kubevirt-ui/kubevirt-api/console/models/ClusterServiceVersionModel';
import SubscriptionModel from '@kubevirt-ui/kubevirt-api/console/models/SubscriptionModel';
import { K8sResourceCommon, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';

import { LSO_NAME, ODF_OPERATOR_NAME } from '../constants';
import { ClusterServiceVersionKind } from '../types';

const watchedResources = {
  installedCSVs: {
    groupVersionKind: modelToGroupVersionKind(ClusterServiceVersionModel),
    isList: true,
    namespaced: true,
  },
  subscriptions: {
    groupVersionKind: modelToGroupVersionKind(SubscriptionModel),
    isList: true,
    namespaced: false,
  },
};

const getSubscriptionForOperator = (subscriptions, operatorName) => {
  return subscriptions.find((sub) => sub?.spec?.name === operatorName);
};

const getCSVForInstalledVersion = (
  clusterServiceVersions,
  installedCSV,
): ClusterServiceVersionKind => {
  return clusterServiceVersions.find((csv) => csv?.metadata?.name === installedCSV);
};

const useKubevirtStorageOperatorCSVs = () => {
  const resources = useK8sWatchResources<{ [key: string]: K8sResourceCommon[] }>(watchedResources);

  const loadErrors = Object.keys(resources).filter((key) => resources?.[key]?.loadError);
  const loaded = Object.keys(resources).every((key) => resources?.[key]?.loaded);

  const subscriptions = resources?.subscriptions;
  const installedCSVs = resources?.installedCSVs;

  const lsoSub = getSubscriptionForOperator(subscriptions?.data, LSO_NAME);
  const lsoCSV = lsoSub
    ? getCSVForInstalledVersion(installedCSVs?.data, lsoSub?.status?.installedCSV)
    : null;

  const odfSub = getSubscriptionForOperator(subscriptions?.data, ODF_OPERATOR_NAME);
  const odfCSV = odfSub
    ? getCSVForInstalledVersion(installedCSVs?.data, odfSub?.status?.installedCSV)
    : null;

  return {
    loaded,
    loadErrors,
    lsoCSV,
    odfCSV,
  };
};

export default useKubevirtStorageOperatorCSVs;
