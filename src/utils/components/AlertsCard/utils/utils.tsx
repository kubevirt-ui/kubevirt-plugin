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
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

export const labelColor = {
  [AlertType.critical]: 'red',
  [AlertType.warning]: 'orange',
  [AlertType.info]: 'blue',
};

export const labelIcon = {
  [AlertType.critical]: <ExclamationCircleIcon />,
  [AlertType.warning]: <ExclamationTriangleIcon />,
  [AlertType.info]: <ExclamationCircleIcon />,
};

export const labelText = {
  [AlertType.critical]: t('Critical'),
  [AlertType.warning]: t('Warning'),
  [AlertType.info]: t('Info'),
};

export const alertIcon = {
  [AlertType.critical]: () => <RedExclamationCircleIcon title="Critical" />,
  [AlertType.warning]: () => <YellowExclamationTriangleIcon title="Warning" />,
  [AlertType.info]: () => <BlueInfoCircleIcon title="Information" />,
};

export const removeVMAlerts = (sortedAlerts: SimplifiedAlerts) =>
  Object.entries(sortedAlerts).reduce(
    (acc, [key, value]) => {
      acc[key] = value?.filter((alert) => !alert?.isVMAlert);

      return acc;
    },
    { critical: [], warning: [], info: [] },
  );

export const createAlertKey = (activeAt: string, labels: PrometheusLabels) =>
  [activeAt, labels?.name, labels?.vmName, labels?.pod, labels?.uid, labels?.instance]
    .filter(Boolean)
    .join('-');

export const alertScopeOptions = () => [
  {
    key: VIRTUALIZATION_ONLY_ALERTS,
    value: t('Show virtualization health alerts'),
    description: t('See only virtualization health alerts'),
  },
  {
    key: ALL_ALERTS,
    value: t('Show all alerts'),
    description: t('See alerts for virtualization health and VMs'),
  },
];
