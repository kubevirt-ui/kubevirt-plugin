import { type TFunction } from 'i18next';

import { HCOHealthStatus } from '@kubevirt-utils/extensions/dashboard/types';
import { HealthState, type PrometheusResult } from '@openshift-console/dynamic-plugin-sdk';
import { type SubscriptionKind, SubscriptionState } from '@overview/utils/types';

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

  for (const result of results) {
    const value = Number(result?.value?.[1]);
    const resultCluster = result?.metric?.cluster;

    if (Number.isNaN(value)) continue;

    if (resultCluster) {
      if (value === HCOHealthStatus.critical) {
        criticalClusters.push(resultCluster);
      } else if (value === HCOHealthStatus.warning) {
        degradedClusters.push(resultCluster);
      }
    }

    // No cluster filter: match only results without a cluster label (local/hub)
    // Cluster filter: match when result has no label or label matches the filter
    const isRelevantResult = !cluster
      ? !resultCluster
      : !resultCluster || resultCluster === cluster;

    if (isRelevantResult) {
      clusterHealthState = hcoValueToHealthState[value] ?? HealthState.NOT_AVAILABLE;
    }
  }

  return { clusterHealthState, criticalClusters, degradedClusters };
};

export const isUpdateAvailable = (subscription: SubscriptionKind): boolean => {
  const { currentCSV, installedCSV, state } = subscription?.status ?? {};

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
