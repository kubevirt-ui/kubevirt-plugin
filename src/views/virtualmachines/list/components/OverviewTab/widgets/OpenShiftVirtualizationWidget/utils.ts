import { TFunction } from 'react-i18next';

import { HCOHealthStatus } from '@kubevirt-utils/extensions/dashboard/types';
import { HealthState, PrometheusResult } from '@openshift-console/dynamic-plugin-sdk';
import { SubscriptionKind, SubscriptionState } from '@overview/utils/types';

const hcoValueToHealthState: Record<number, HealthState> = {
  [HCOHealthStatus.critical]: HealthState.ERROR,
  [HCOHealthStatus.none]: HealthState.OK,
  [HCOHealthStatus.warning]: HealthState.WARNING,
};

export const HCO_HEALTH_QUERY = 'kubevirt_hyperconverged_operator_health_status';

type ProcessHealthResultsReturn = {
  clusterHealthState: HealthState;
  criticalClusters: string[];
  degradedClusters: string[];
};

export const processHealthResults = (
  results: PrometheusResult[],
  cluster?: string,
): ProcessHealthResultsReturn => {
  const criticalClusters: string[] = [];
  const degradedClusters: string[] = [];
  let clusterHealthState = HealthState.NOT_AVAILABLE;

  results.forEach((result) => {
    const value = Number(result?.value?.[1]);
    const resultCluster = result?.metric?.cluster;

    if (Number.isNaN(value)) return;

    if (value === HCOHealthStatus.critical) {
      if (resultCluster) criticalClusters.push(resultCluster);
    } else if (value === HCOHealthStatus.warning) {
      if (resultCluster) degradedClusters.push(resultCluster);
    }

    // isLocalMatch: no cluster filter requested and result has no cluster label (local/hub cluster)
    const isLocalMatch = !cluster && !resultCluster;
    // isClusterMatch: cluster filter set; also matches results without a label for backward
    // compatibility with non-multi-cluster setups where metrics lack a cluster dimension
    const isClusterMatch = cluster && (!resultCluster || resultCluster === cluster);

    if (isLocalMatch || isClusterMatch) {
      clusterHealthState = hcoValueToHealthState[value] ?? HealthState.NOT_AVAILABLE;
    }
  });

  return { clusterHealthState, criticalClusters, degradedClusters };
};

export const isUpdateAvailable = (subscription: SubscriptionKind): boolean => {
  const { currentCSV, installedCSV, state } = subscription?.status || {};

  if (
    state === SubscriptionState.SubscriptionStateUpgradeAvailable ||
    state === SubscriptionState.SubscriptionStateUpgradePending
  ) {
    return true;
  }

  if (currentCSV && installedCSV && currentCSV !== installedCSV) {
    return true;
  }

  return false;
};

export const NBSP = '\u00A0';

export const getHealthStateToMessage = (t: TFunction): Record<string, string> => ({
  [HealthState.ERROR]: t('Error'),
  [HealthState.NOT_AVAILABLE]: t('Not available'),
  [HealthState.OK]: t('Available'),
  [HealthState.WARNING]: t('Degraded'),
});
