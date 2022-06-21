import * as React from 'react';

import { CatalogSourceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/CatalogSourceModel';
import { ClusterServiceVersionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/ClusterServiceVersionModel';
import { SubscriptionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/SubscriptionModel';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { useDeepCompareMemoize } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useDeepCompareMemoize';

import { CatalogSourceKind, ClusterServiceVersionKind, SubscriptionKind } from '../utils/types';

import { useDebounceCallback } from './useDebounceCallback';

const getKubevirtCSV = (clusterServiceVersions, installedCSV): ClusterServiceVersionKind => {
  return clusterServiceVersions.find((csv) => csv?.metadata?.name === installedCSV);
};

const getKubevirtSubscription = (subscriptions) => {
  return subscriptions.find((sub) => sub?.metadata?.name === 'hco-operatorhub');
};

const isPackageServer = (obj) =>
  obj?.metadata?.name === 'packageserver' &&
  obj?.metadata?.namespace === 'openshift-operator-lifecycle-manager';

const catalogSourceForSubscription = (
  subscription: SubscriptionKind,
  catalogSources: CatalogSourceKind[] = [],
): CatalogSourceKind =>
  catalogSources.find(
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
  kubevirtSub: SubscriptionKind;
  catalogSourceMissing: boolean;
  loaded: boolean;
  loadError: string;
};

export const useKubevirtCSVDetails = (): UseKubevirtCSVDetails => {
  const [displayName, setDisplayName] = React.useState<string>();
  const [provider, setProvider] = React.useState<string>();
  const [version, setVersion] = React.useState<string>();
  const [updateChannel, setUpdateChannel] = React.useState<string>();
  const [operatorLink, setOperatorLink] = React.useState<string>();
  const [kubevirtSub, setKubevirtSub] = React.useState<SubscriptionKind>();
  const [catalogSourceMissing, setCatalogSourceMissing] = React.useState<boolean>(false);
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [loadError, setLoadError] = React.useState<string>('');

  const watchedResources = {
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

  const resources = useK8sWatchResources<{ [key: string]: K8sResourceCommon[] }>(watchedResources);

  const updateResults = (updatedResources) => {
    const errorKey = Object.keys(updatedResources).find((key) => updatedResources[key].loadError);
    if (errorKey) {
      setLoaded(false);
      setLoadError(updatedResources[errorKey].loadError);
      return;
    }

    if (
      Object.keys(updatedResources).length > 0 &&
      Object.keys(updatedResources).every((key) => updatedResources[key].loaded)
    ) {
      const kubevirtSubscription: SubscriptionKind = getKubevirtSubscription(
        updatedResources.subscriptions.data,
      );

      const kubevirtCSV: ClusterServiceVersionKind = getKubevirtCSV(
        updatedResources.installedCSVs.data,
        kubevirtSubscription?.status?.installedCSV,
      );

      const catalogSrcMissing =
        isEmpty(updatedResources.catalogSources.data) &&
        !catalogSourceForSubscription(kubevirtSub, updatedResources.catalogSources.data) &&
        !isPackageServer(kubevirtCSV);

      const name = kubevirtCSV?.metadata?.name;
      const namespace = kubevirtCSV?.metadata?.namespace;
      const operatorVersion = kubevirtCSV?.spec?.version;
      const link = getOperatorLink(name, namespace);

      setDisplayName(kubevirtCSV?.spec?.displayName);
      setProvider(kubevirtCSV?.spec?.provider?.name);
      setVersion(operatorVersion);
      setUpdateChannel(kubevirtSubscription?.spec?.channel);
      setKubevirtSub(kubevirtSubscription);
      setCatalogSourceMissing(catalogSrcMissing);
      setOperatorLink(link);

      setLoaded(true);
      setLoadError(null);
    }
  };
  const debouncedUpdateResources = useDebounceCallback(updateResults, 50);

  React.useEffect(() => {
    debouncedUpdateResources(resources);
  }, [debouncedUpdateResources, resources]);

  return useDeepCompareMemoize({
    displayName,
    provider,
    version,
    updateChannel,
    operatorLink,
    kubevirtSub,
    catalogSourceMissing,
    loaded,
    loadError,
  });
};
