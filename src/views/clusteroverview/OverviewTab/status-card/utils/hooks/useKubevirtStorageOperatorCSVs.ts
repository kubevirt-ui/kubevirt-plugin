import { modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { ClusterServiceVersionModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { SubscriptionModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { type SubscriptionKind } from '@overview/utils/types';

import { LSO_NAME, ODF_OPERATOR_NAME } from '../constants';
import { type ClusterServiceVersionKind } from '../types';

type WatchedStorageResources = {
  installedCSVs: ClusterServiceVersionKind[];
  subscriptions: SubscriptionKind[];
};

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

const getSubscriptionForOperator = (
  subscriptions: SubscriptionKind[],
  operatorName: string,
): SubscriptionKind | undefined => subscriptions.find((sub) => sub.spec?.name === operatorName);

const getCSVForInstalledVersion = (
  clusterServiceVersions: ClusterServiceVersionKind[],
  installedCSV: string | undefined,
): ClusterServiceVersionKind | undefined =>
  clusterServiceVersions.find((csv) => csv.metadata?.name === installedCSV);

type UseKubevirtStorageOperatorCSVsReturn = {
  loaded: boolean;
  loadErrors: string[];
  lsoCSV: ClusterServiceVersionKind | null;
  odfCSV: ClusterServiceVersionKind | null;
};

const useKubevirtStorageOperatorCSVs = (): UseKubevirtStorageOperatorCSVsReturn => {
  const resources = useK8sWatchResources<WatchedStorageResources>(watchedResources);

  const loadErrors = Object.keys(resources).filter((key) => resources[key]?.loadError);
  const loaded = Object.keys(resources).every((key) => resources[key]?.loaded);

  const lsoSub = getSubscriptionForOperator(resources.subscriptions.data, LSO_NAME);
  const lsoCSV = lsoSub
    ? (getCSVForInstalledVersion(resources.installedCSVs.data, lsoSub.status?.installedCSV) ?? null)
    : null;

  const odfSub = getSubscriptionForOperator(resources.subscriptions.data, ODF_OPERATOR_NAME);
  const odfCSV = odfSub
    ? (getCSVForInstalledVersion(resources.installedCSVs.data, odfSub.status?.installedCSV) ?? null)
    : null;

  return {
    loaded,
    loadErrors,
    lsoCSV,
    odfCSV,
  };
};

export default useKubevirtStorageOperatorCSVs;
