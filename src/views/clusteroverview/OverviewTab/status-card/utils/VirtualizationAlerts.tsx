import * as React from 'react';

import { AlertItem, AlertsBody } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Alert } from '@openshift-console/dynamic-plugin-sdk-internal/lib/api/common-types';

// File will be removed with the rest of clusteroverview/OverviewTab/status-card
const VirtualizationAlerts: React.FC = () => {
  const alerts: Alert[] = [];

  return (
    <AlertsBody error={false}>
      {alerts.map((alert) => (
        <AlertItem alert={alert} key={alert?.rule?.id} />
      ))}
    </AlertsBody>
  );
};

export default VirtualizationAlerts;
