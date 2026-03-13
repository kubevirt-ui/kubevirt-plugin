import { useMemo } from 'react';

import { CatalogSourceModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { ClusterServiceVersionModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtClusterServiceVersion } from '@kubevirt-utils/hooks/useKubevirtClusterServiceVersion';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { OPENSHIFT_OPERATOR_LIFECYCLE_MANAGER_NAMESPACE, PACKAGESERVER } from '../constants';
import { CatalogSourceKind, ClusterServiceVersionKind, SubscriptionKind } from '../types';

import { buildUrlForCSVSubscription } from './../utils';

type UseKubevirtCSVDetails = {
  catalogSourceMissing: boolean;
  displayName: string;
  installedCSV: ClusterServiceVersionKind;
  kubevirtSubscription: SubscriptionKind;
  loaded: boolean;
  loadErrors: Error[];
  operatorLink: string;
  provider: string;
  updateChannel: string;
  version: string;
};

export const useKubevirtCSVDetails = (cluster?: string): UseKubevirtCSVDetails => {
  const {
    installedCSV,
    loaded: loadedCSV,
    loadErrors: loadCSVError,
    subscription,
  } = useKubevirtClusterServiceVersion(cluster);

  const [catalogSource, loadedSource, loadSourceError] = useK8sWatchData<CatalogSourceKind>(
    subscription && {
      cluster,
      groupVersionKind: CatalogSourceModelGroupVersionKind,
      name: subscription?.spec?.source,
      namespace: subscription?.spec?.sourceNamespace,
    },
  );

  const loadErrors = loadSourceError || loadCSVError;

  const loaded = loadedCSV && loadedSource;

  const catalogSourceMissing = useMemo(
    () =>
      !catalogSource &&
      !(
        installedCSV?.metadata?.name === PACKAGESERVER &&
        installedCSV?.metadata?.namespace === OPENSHIFT_OPERATOR_LIFECYCLE_MANAGER_NAMESPACE
      ),
    [catalogSource, installedCSV?.metadata],
  );

  const { displayName, provider, version } = useMemo(() => {
    return {
      displayName: installedCSV?.spec?.displayName,
      provider: installedCSV?.spec?.provider?.name,
      version: installedCSV?.spec?.version,
    };
  }, [installedCSV?.spec]);

  const operatorLink = useMemo(
    () =>
      buildUrlForCSVSubscription(
        ClusterServiceVersionModel,
        installedCSV?.metadata?.name,
        installedCSV?.metadata?.namespace,
      ),
    [installedCSV?.metadata],
  );

  return {
    catalogSourceMissing,
    displayName,
    installedCSV,
    kubevirtSubscription: subscription,
    loaded,
    loadErrors,
    operatorLink,
    provider,
    updateChannel: subscription?.spec?.channel,
    version,
  };
};
