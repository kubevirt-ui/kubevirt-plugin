import React from 'react';

import {
  ALL_ALERTS,
  VIRTUALIZATION_ONLY_ALERTS,
} from '@kubevirt-utils/components/AlertsCard/utils/constants';
import { AlertType, SimplifiedAlerts } from '@kubevirt-utils/components/AlertsCard/utils/types';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PrometheusLabels } from '@openshift-console/dynamic-plugin-sdk';
import {
  BlueInfoCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/icons';

export const labelStatus = {
  [AlertType.critical]: 'danger',
  [AlertType.info]: 'info',
  [AlertType.warning]: 'warning',
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
    // eslint-disable-next-line perfectionist/sort-objects
    { critical: [], warning: [], info: [] },
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
