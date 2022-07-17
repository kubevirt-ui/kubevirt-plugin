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
import { Extension, ExtensionTypeGuard } from '@openshift-console/dynamic-plugin-sdk/lib/types';
import { Alert } from '@openshift-console/dynamic-plugin-sdk-internal/lib/api/common-types';
import { InProgressIcon } from '@patternfly/react-icons';

import BlueArrowCircleUpIcon from '../../../utils/Components/BlueArrowCircleUpIcon';
import { ClusterServiceVersionPhase } from '../../../utils/types';

import BlueSyncIcon from './health-state-icons/BlueSyncIcon';
import GrayUnknownIcon from './health-state-icons/GrayUnknownIcon';
import { CLUSTER } from './constants';
import { ClusterServiceVersionKind } from './types';

export const NetworkAddonsConfigResource: WatchK8sResource = {
  groupVersionKind: modelToGroupVersionKind(NetworkAddonsConfigModel),
  namespaced: false,
  isList: true,
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
        state: HealthState.OK,
        message: t('Available'),
      };
    case ClusterServiceVersionPhase.CSVPhaseFailed:
      return {
        state: HealthState.ERROR,
        message: t('Error'),
      };
    default:
      return {
        state: HealthState.NOT_AVAILABLE,
        message: t('Not available'),
      };
  }
};

export const getStorageOperatorHealthStatus = (operatorCSV, loaded, loadErrors, t) => {
  if (!loaded) {
    return { state: HealthState.LOADING };
  }
  if (!isEmpty(loadErrors) || !operatorCSV) {
    return { state: HealthState.NOT_AVAILABLE, message: t('Not available') };
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
  [HealthState.OK]: {
    priority: 0,
    health: HealthState.OK,
    icon: <GreenCheckCircleIcon title="Healthy" />,
  },
  [HealthState.UNKNOWN]: {
    priority: 1,
    health: HealthState.UNKNOWN,
    icon: <GrayUnknownIcon title="Unknown" />,
  },
  [HealthState.PROGRESS]: {
    priority: 2,
    health: HealthState.PROGRESS,
    icon: <InProgressIcon title="In progress" />,
  },
  [HealthState.UPDATING]: {
    priority: 3,
    health: HealthState.UPDATING,
    icon: <BlueSyncIcon title="Updating" />,
  },
  [HealthState.UPGRADABLE]: {
    priority: 4,
    health: HealthState.UPGRADABLE,
    icon: <BlueArrowCircleUpIcon title="Upgrade available" />,
  },
  [HealthState.WARNING]: {
    priority: 5,
    health: HealthState.WARNING,
    icon: <YellowExclamationTriangleIcon title="Warning" />,
  },
  [HealthState.ERROR]: {
    priority: 6,
    health: HealthState.ERROR,
    icon: <RedExclamationCircleIcon title="Error" />,
  },
  [HealthState.LOADING]: {
    priority: 7,
    health: HealthState.LOADING,
    icon: <div className="skeleton-health" />,
  },
  [HealthState.NOT_AVAILABLE]: {
    priority: 8,
    health: HealthState.NOT_AVAILABLE,
    icon: <GrayUnknownIcon title="Not available" />,
  },
};

export type HealthStateMappingValues = {
  icon: React.ReactNode;
  priority: number;
  health: HealthState;
};

export type MonitoringResource = {
  abbr: string;
  kind: string;
  label: string;
  plural: string;
};

export const AlertResource: MonitoringResource = {
  kind: 'Alert',
  label: 'Alert',
  plural: '/monitoring/alerts',
  abbr: 'AL',
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
