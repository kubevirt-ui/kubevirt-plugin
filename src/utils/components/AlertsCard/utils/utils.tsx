import React, { type ReactElement } from 'react';

import {
  ALL_ALERTS,
  VIRTUALIZATION_ONLY_ALERTS,
} from '@kubevirt-utils/components/AlertsCard/utils/constants';
import {
  AlertType,
  type SimplifiedAlert,
  type SimplifiedAlerts,
} from '@kubevirt-utils/components/AlertsCard/utils/types';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type PrometheusLabels } from '@openshift-console/dynamic-plugin-sdk';
import {
  BlueInfoCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/icons';

type LabelStatus = 'custom' | 'danger' | 'info' | 'success' | 'warning';

export const labelStatus: Record<string, LabelStatus> = {
  [AlertType.Critical]: 'danger',
  [AlertType.Info]: 'info',
  [AlertType.Warning]: 'warning',
};

export const labelText: Record<string, string> = {
  [AlertType.Critical]: t('Critical'),
  [AlertType.Info]: t('Info'),
  [AlertType.Warning]: t('Warning'),
};

export const alertIcon: Record<string, () => ReactElement> = {
  [AlertType.Critical]: (): ReactElement => <RedExclamationCircleIcon title="Critical" />,
  [AlertType.Info]: (): ReactElement => <BlueInfoCircleIcon title="Information" />,
  [AlertType.Warning]: (): ReactElement => <YellowExclamationTriangleIcon title="Warning" />,
};

export const removeVMAlerts = (sortedAlerts: SimplifiedAlerts): SimplifiedAlerts =>
  (Object.entries(sortedAlerts) as [AlertType, SimplifiedAlert[]][]).reduce<SimplifiedAlerts>(
    (acc, [key, value]) => {
      acc[key] = value?.filter((alert) => !alert?.isVMAlert);

      return acc;
    },
    { critical: [], info: [], warning: [] } as SimplifiedAlerts,
  );

export const createAlertKey = (activeAt: string, labels: PrometheusLabels): string =>
  [activeAt, labels?.name, labels?.vmName, labels?.pod, labels?.uid, labels?.instance]
    .filter(Boolean)
    .join('-');

export const alertScopeOptions = (): { description: string; key: string; value: string }[] => [
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
