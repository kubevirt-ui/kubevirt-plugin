import * as React from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { AlertItem, AlertsBody } from '@openshift-console/dynamic-plugin-sdk-internal';

import useFilteredAlerts from './hooks/useFilteredAlerts';
import { getAlertURL, isKubeVirtAlert } from './utils';

const VirtualizationAlerts: React.FC = () => {
  const [alerts, , loadError] = useFilteredAlerts(isKubeVirtAlert);

  return (
    <AlertsBody error={!isEmpty(loadError)}>
      {alerts.map((alert) => (
        <AlertItem key={getAlertURL(alert, alert.rule.id)} alert={alert} />
      ))}
    </AlertsBody>
  );
};

export default VirtualizationAlerts;
