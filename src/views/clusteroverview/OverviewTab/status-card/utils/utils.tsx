import * as React from 'react';
import { TFunction } from 'i18next';

import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import NetworkAddonsConfigModel from '@kubevirt-ui/kubevirt-api/console/models/NetworkAddonsConfigModel';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  GreenCheckCircleIcon,
  HealthState,
  K8sModel,
  PrometheusLabels,
  RedExclamationCircleIcon,
  ResolvedExtension,
  WatchK8sResource,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Alert } from '@openshift-console/dynamic-plugin-sdk';
import { Extension, ExtensionTypeGuard } from '@openshift-console/dynamic-plugin-sdk/lib/types';
import { InProgressIcon } from '@patternfly/react-icons';

import BlueArrowCircleUpIcon from '../../../utils/Components/BlueArrowCircleUpIcon';
import { ClusterServiceVersionPhase } from '../../../utils/types';

import BlueSyncIcon from './health-state-icons/BlueSyncIcon';
import GrayUnknownIcon from './health-state-icons/GrayUnknownIcon';
import { CLUSTER } from './constants';
import { ClusterServiceVersionKind } from './types';

export const NetworkAddonsConfigResource: WatchK8sResource = {
  groupVersionKind: modelToGroupVersionKind(NetworkAddonsConfigModel),
  isList: true,
  namespaced: false,
};

export const getClusterNAC = (nacList) => nacList?.find((nac) => nac?.metadata?.name === CLUSTER);

export const filterSubsystems = <E extends Extension>(
  subsystems: ResolvedExtension<E>[],
  typeGuard: ExtensionTypeGuard<E>,
  k8sModels: { [key: string]: K8sModel },
) =>
  subsystems.filter((s) => {
    // TODO Fix typing
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (typeGuard(s)) {
      const subsystem = s as unknown as ResolvedExtension<E>;
      return subsystem?.properties?.additionalResource &&
        !subsystem?.properties?.additionalResource?.optional
        ? !!k8sModels[subsystem?.properties?.additionalResource?.kind]
        : true;
    }
    return true;
  });

const getHealthStatusFromCSV = (csv: ClusterServiceVersionKind, t: TFunction) => {
  const csvStatus = csv?.status?.phase;
  switch (csvStatus) {
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

export const getStorageOperatorHealthStatus = (operatorCSV, loaded, loadErrors, t) => {
  if (!loaded) {
    return { state: HealthState.LOADING };
  }
  if (!isEmpty(loadErrors) || !operatorCSV) {
    return { message: t('Not available'), state: HealthState.NOT_AVAILABLE };
  }
  return getHealthStatusFromCSV(operatorCSV, t);
};

export const getOverallStorageStatus = (lsoState, odfState, loaded, loadErrors) => {
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

export const healthStateMapping: { [key in HealthState]: HealthStateMappingValues } = {
  [HealthState.ERROR]: {
    health: HealthState.ERROR,
    icon: <RedExclamationCircleIcon title="Error" />,
    priority: 6,
  },
  [HealthState.LOADING]: {
    health: HealthState.LOADING,
    icon: <div className="skeleton-health" />,
    priority: 7,
  },
  [HealthState.NOT_AVAILABLE]: {
    health: HealthState.NOT_AVAILABLE,
    icon: <GrayUnknownIcon title="Not available" />,
    priority: 8,
  },
  [HealthState.OK]: {
    health: HealthState.OK,
    icon: <GreenCheckCircleIcon title="Healthy" />,
    priority: 0,
  },
  [HealthState.PROGRESS]: {
    health: HealthState.PROGRESS,
    icon: <InProgressIcon title="In progress" />,
    priority: 2,
  },
  [HealthState.UNKNOWN]: {
    health: HealthState.UNKNOWN,
    icon: <GrayUnknownIcon title="Unknown" />,
    priority: 1,
  },
  [HealthState.UPDATING]: {
    health: HealthState.UPDATING,
    icon: <BlueSyncIcon title="Updating" />,
    priority: 3,
  },
  [HealthState.UPGRADABLE]: {
    health: HealthState.UPGRADABLE,
    icon: <BlueArrowCircleUpIcon title="Upgrade available" />,
    priority: 4,
  },
  [HealthState.WARNING]: {
    health: HealthState.WARNING,
    icon: <YellowExclamationTriangleIcon title="Warning" />,
    priority: 5,
  },
};

export type HealthStateMappingValues = {
  health: HealthState;
  icon: React.ReactNode;
  priority: number;
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

export const labelsToParams = (labels: PrometheusLabels) =>
  Object.entries(labels)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

export const getAlertURL = (alert: Alert, ruleID: string) =>
  `${AlertResource.plural}/${ruleID}?${labelsToParams(alert.labels)}`;

export const asArray = (value) => {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
};
