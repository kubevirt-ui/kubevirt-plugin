import { useMemo } from 'react';

import { CatalogSourceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/CatalogSourceModel';
import ClusterServiceVersionModel, {
  ClusterServiceVersionModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console/models/ClusterServiceVersionModel';
import { SubscriptionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/SubscriptionModel';
import { isUpstream } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import {
  HCO_OPERATORHUB_NAME,
  KUBEVIRT_HYPERCONVERGED,
  OPENSHIFT_CNV,
  OPENSHIFT_OPERATOR_LIFECYCLE_MANAGER_NAMESPACE,
  PACKAGESERVER,
} from '../constants';
import { CatalogSourceKind, ClusterServiceVersionKind, SubscriptionKind } from '../types';

import { buildUrlForCSVSubscription } from './../utils';

type UseKubevirtCSVDetails = {
  catalogSourceMissing: boolean;
  displayName: string;
  kubevirtSubscription: SubscriptionKind;
  loaded: boolean;
  loadErrors: Error[];
  operatorLink: string;
  provider: string;
  updateChannel: string;
  version: string;
};

export const useKubevirtCSVDetails = (): UseKubevirtCSVDetails => {
  const [subscription, loadedSubscription, loadSubscriptionError] =
    useK8sWatchResource<SubscriptionKind>({
      groupVersionKind: SubscriptionModelGroupVersionKind,
      name: HCO_OPERATORHUB_NAME,
      namespace: isUpstream ? KUBEVIRT_HYPERCONVERGED : OPENSHIFT_CNV,
    });

  const [installedCSV, loadedCSV, loadCSVError] = useK8sWatchResource<ClusterServiceVersionKind>(
    subscription && {
      groupVersionKind: ClusterServiceVersionModelGroupVersionKind,
      name: subscription?.status?.installedCSV,
      namespace: subscription?.metadata?.namespace,
    },
  );

  const [catalogSource, loadedSource, loadSourceError] = useK8sWatchResource<CatalogSourceKind>(
    subscription && {
      groupVersionKind: CatalogSourceModelGroupVersionKind,
      name: subscription?.spec?.source,
      namespace: subscription?.spec?.sourceNamespace,
    },
  );

  const loadErrors = loadSourceError || loadSubscriptionError || loadCSVError;

  const loaded = loadedSubscription && loadedCSV && loadedSource;

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
    kubevirtSubscription: subscription,
    loaded,
    loadErrors,
    operatorLink,
    provider,
    updateChannel: subscription?.spec?.channel,
    version,
  };
};
