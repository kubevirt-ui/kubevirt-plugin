import { CatalogSourceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/CatalogSourceModel';
import { ClusterServiceVersionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/ClusterServiceVersionModel';
import { SubscriptionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/SubscriptionModel';
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';

import { CatalogSourceKind, ClusterServiceVersionKind, SubscriptionKind } from '../types';

const getKubevirtCSV = (
  clusterServiceVersions: ClusterServiceVersionKind[],
  installedCSV: string,
): ClusterServiceVersionKind | null =>
  clusterServiceVersions.find((csv) => csv?.metadata?.name === installedCSV);

const getKubevirtSubscription = (subscriptions: SubscriptionKind[]): SubscriptionKind | null =>
  subscriptions.find((sub) => sub?.metadata?.name === 'hco-operatorhub');

const isPackageServer = (csv: ClusterServiceVersionKind) =>
  csv?.metadata?.name === 'packageserver' &&
  csv?.metadata?.namespace === 'openshift-operator-lifecycle-manager';

const catalogSourceForSubscription = (
  subscription: SubscriptionKind,
  catalogSources: CatalogSourceKind[],
): CatalogSourceKind =>
  catalogSources?.find(
    (source) =>
      source?.metadata?.name === subscription?.spec?.source &&
      source?.metadata?.namespace === subscription?.spec?.sourceNamespace,
  );

const getOperatorLink = (name, namespace) =>
  `/k8s/ns/${namespace}/operators.coreos.com~v1alpha1~ClusterServiceVersion/${name}`;

type UseKubevirtCSVDetails = {
  displayName: string;
  provider: string;
  version: string;
  updateChannel: string;
  operatorLink: string;
  kubevirtSubscription: SubscriptionKind;
  catalogSourceMissing: boolean;
  loaded: boolean;
  loadErrors: string[];
};

type Resources = {
  installedCSVs: ClusterServiceVersionKind[];
  subscriptions: SubscriptionKind[];
  catalogSources: CatalogSourceKind[];
};

const kubevirtCSVResources = {
  installedCSVs: {
    groupVersionKind: ClusterServiceVersionModelGroupVersionKind,
    isList: true,
    namespaced: false,
  },
  subscriptions: {
    groupVersionKind: SubscriptionModelGroupVersionKind,
    isList: true,
    namespaced: false,
  },
  catalogSources: {
    groupVersionKind: CatalogSourceModelGroupVersionKind,
    isList: true,
    optional: true,
  },
};
export const useKubevirtCSVDetails = (): UseKubevirtCSVDetails => {
  const resources = useK8sWatchResources<Resources>(kubevirtCSVResources);

  const loadErrors = Object.keys(resources).filter((key) => resources?.[key]?.loadError);
  const loaded = Object.keys(resources).every((key) => resources?.[key]?.loaded);

  const kubevirtSubscription = getKubevirtSubscription(resources.subscriptions.data);

  const kubevirtCSV = getKubevirtCSV(
    resources.installedCSVs.data,
    kubevirtSubscription?.status?.installedCSV,
  );

  const catalogSourceMissing =
    !catalogSourceForSubscription(kubevirtSubscription, resources.catalogSources.data) &&
    !isPackageServer(kubevirtCSV);

  const {
    displayName = '',
    version = '',
    provider: { name: provider = '' } = {},
  } = kubevirtCSV?.spec || {};

  const operatorLink =
    getOperatorLink(kubevirtCSV?.metadata?.name, kubevirtCSV?.metadata?.namespace) || '';

  const updateChannel = kubevirtSubscription?.spec?.channel || '';

  return {
    displayName,
    provider,
    version,
    updateChannel,
    operatorLink,
    kubevirtSubscription,
    catalogSourceMissing,
    loaded,
    loadErrors,
  };
};
