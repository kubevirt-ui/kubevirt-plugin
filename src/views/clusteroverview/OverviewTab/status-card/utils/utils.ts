import {
  modelToGroupVersionKind,
  NetworkAddonsConfigModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  type Alert,
  HealthState,
  type K8sResourceCommon,
  type PrometheusLabels,
  type WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';

import { ClusterServiceVersionPhase } from '../../../utils/types';
import { CLUSTER } from './constants';
import { type ClusterServiceVersionKind } from './types';

export type { HealthStateMappingValues } from './health-state-icons/healthStateMapping';
export { getHealthStateIcon, healthStateMapping } from './health-state-icons/healthStateMapping';

export const NetworkAddonsConfigResource: WatchK8sResource = {
  groupVersionKind: modelToGroupVersionKind(NetworkAddonsConfigModel),
  isList: true,
  namespaced: false,
};

export const getClusterNAC = (
  nacList: K8sResourceCommon[] | undefined,
): K8sResourceCommon | undefined => nacList?.find((nac) => nac?.metadata?.name === CLUSTER);

export type StorageHealthState = {
  message?: string;
  state: HealthState;
};

export const getHealthStatusFromCSV = (
  csvPhase: ClusterServiceVersionPhase | undefined,
): { message: string; state: HealthState } => {
  switch (csvPhase) {
    case ClusterServiceVersionPhase.CSVPhaseSucceeded:
      return {
        message: t('Available'),
        state: HealthState.OK,
      };
    case ClusterServiceVersionPhase.CSVPhaseFailed:
      return {
        message: t('Error'),
        state: HealthState.ERROR,
      };
    default:
      return {
        message: t('Not available'),
        state: HealthState.NOT_AVAILABLE,
      };
  }
};

export const getStorageOperatorHealthStatus = (
  operatorCSV: ClusterServiceVersionKind | null | undefined,
  loaded: boolean,
  loadErrors: unknown,
): StorageHealthState => {
  if (!loaded) {
    return { state: HealthState.LOADING };
  }
  if (!isEmpty(loadErrors) || !operatorCSV) {
    return { message: t('Not available'), state: HealthState.NOT_AVAILABLE };
  }
  return getHealthStatusFromCSV(operatorCSV?.status?.phase);
};

export const getOverallStorageStatus = (
  lsoState: StorageHealthState,
  odfState: StorageHealthState,
  loaded: boolean,
  loadErrors: unknown,
): { state: HealthState } => {
  const lsoAvailable = lsoState.state === HealthState.OK;
  const odfAvailable = odfState.state === HealthState.OK;

  if (!loaded) {
    return { state: HealthState.LOADING };
  }
  if (!isEmpty(loadErrors)) {
    return { state: HealthState.ERROR };
  }
  if (lsoAvailable || odfAvailable) {
    return { state: HealthState.OK };
  }
  return { state: HealthState.NOT_AVAILABLE };
};

export type MonitoringResource = {
  abbr: string;
  kind: string;
  label: string;
  plural: string;
};

export const AlertResource: MonitoringResource = {
  abbr: 'AL',
  kind: 'Alert',
  label: 'Alert',
  plural: '/monitoring/alerts',
};

/**
 * Build alert URL filtered by alertname
 * Uses alertname filter instead of rule ID since IDs from MCO don't match spoke cluster IDs
 */
export const getAlertFilterURL = (alertName: string): string => {
  const params = new URLSearchParams();
  params.set('name', alertName);
  return `${AlertResource.plural}?${params.toString()}`;
};

/**
 * Build external URL for spoke cluster alerts
 * Navigates to the spoke cluster's monitoring console filtered by alertname
 */
export const getExternalAlertURL = (
  alertName: string,
  clusterConsoleURL: string | undefined,
): string | undefined => {
  if (!clusterConsoleURL || !alertName) {
    return undefined;
  }

  const alertPath = getAlertFilterURL(alertName);

  const baseURL = clusterConsoleURL.endsWith('/')
    ? clusterConsoleURL.slice(0, -1)
    : clusterConsoleURL;

  return `${baseURL}${alertPath}`;
};

export const labelsToParams = (labels: PrometheusLabels): string =>
  Object.entries(labels)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

export const getAlertURL = (alert: Alert, ruleID: string): string =>
  `${AlertResource.plural}/${ruleID}?${labelsToParams(alert.labels)}`;

export const asArray = <Value>(value: null | undefined | Value | Value[]): Value[] => {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
};
