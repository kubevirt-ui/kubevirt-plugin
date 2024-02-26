import React from 'react';

import {
  ALL_ALERTS,
  VIRTUALIZATION_ONLY_ALERTS,
} from '@kubevirt-utils/components/AlertsCard/utils/constants';
import { AlertType, SimplifiedAlerts } from '@kubevirt-utils/components/AlertsCard/utils/types';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  PrometheusLabels,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  BlueInfoCircleIcon,
  RedExclamationCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/icons';
import { ExclamationCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';

export const labelColor = {
  [AlertType.critical]: 'red',
  [AlertType.info]: 'blue',
  [AlertType.warning]: 'orange',
};

export const labelIcon = {
  [AlertType.critical]: <ExclamationCircleIcon />,
  [AlertType.info]: <ExclamationCircleIcon />,
  [AlertType.warning]: <ExclamationTriangleIcon />,
};

export const labelText = {
  [AlertType.critical]: t('Critical'),
  [AlertType.info]: t('Info'),
  [AlertType.warning]: t('Warning'),
};

export const alertIcon = {
  [AlertType.critical]: () => <RedExclamationCircleIcon title="Critical" />,
  [AlertType.info]: () => <BlueInfoCircleIcon title="Information" />,
  [AlertType.warning]: () => <YellowExclamationTriangleIcon title="Warning" />,
};

export const removeVMAlerts = (sortedAlerts: SimplifiedAlerts) =>
  Object.entries(sortedAlerts).reduce(
    (acc, [key, value]) => {
      acc[key] = value?.filter((alert) => !alert?.isVMAlert);

      return acc;
    },
    { critical: [], info: [], warning: [] },
  );

export const createAlertKey = (activeAt: string, labels: PrometheusLabels) =>
  [activeAt, labels?.name, labels?.vmName, labels?.pod, labels?.uid, labels?.instance]
    .filter(Boolean)
    .join('-');

export const alertScopeOptions = () => [
  {
    description: t('See only virtualization health alerts'),
    key: VIRTUALIZATION_ONLY_ALERTS,
    value: t('Show virtualization health alerts'),
  },
  {
    description: t('See alerts for virtualization health and VMs'),
    key: ALL_ALERTS,
    value: t('Show all alerts'),
  },
];
