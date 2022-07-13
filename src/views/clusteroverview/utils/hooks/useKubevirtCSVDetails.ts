import { CatalogSourceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/CatalogSourceModel';
import ClusterServiceVersionModel, {
  ClusterServiceVersionModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console/models/ClusterServiceVersionModel';
import { SubscriptionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/SubscriptionModel';
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';

import { CatalogSourceKind, ClusterServiceVersionKind, SubscriptionKind } from '../types';

import { buildUrlForCSVSubscription } from './../utils';

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

type UseKubevirtCSVDetails = {
  displayName: string;
  provider: string;
  version: string;
  updateChannel: string;
  operatorLink: string;
  kubevirtSubscription: SubscriptionKind;
  catalogSourceMissing: boolean;
  loaded: boolean;
  loadErrors: Error[];
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

  const loadErrors = Object.values(resources).reduce((acc, value) => {
    value?.loadError && acc.push(value?.loadError);
    return acc;
  }, []);

  const loaded = Object.values(resources).every((value) => value?.loaded);

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

  const operatorLink = buildUrlForCSVSubscription(
    ClusterServiceVersionModel,
    kubevirtSubscription?.status?.installedCSV,
    kubevirtSubscription?.metadata?.namespace,
  );

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
