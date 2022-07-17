import * as React from 'react';

import useKubevirtAlerts from '@kubevirt-utils/hooks/useKubevirtAlerts';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { AlertItem, AlertsBody } from '@openshift-console/dynamic-plugin-sdk-internal';

import { getAlertURL } from './utils';

const VirtualizationAlerts: React.FC = () => {
  const [alerts, , loadError] = useKubevirtAlerts();

  return (
    <AlertsBody error={!isEmpty(loadError)}>
      {alerts.map((alert) => (
        <AlertItem key={getAlertURL(alert, alert.rule.id)} alert={alert} />
      ))}
    </AlertsBody>
  );
};

export default VirtualizationAlerts;
