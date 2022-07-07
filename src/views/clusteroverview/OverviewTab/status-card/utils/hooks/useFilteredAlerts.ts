import * as React from 'react';

import { useDashboardResources } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Alert } from '@openshift-console/dynamic-plugin-sdk-internal/lib/api/common-types';

export type UseFilteredAlerts = (filter: any) => [Alert[], boolean, Error];

const useFilteredAlerts: UseFilteredAlerts = (filter) => {
  const { notificationAlerts } = useDashboardResources({});
  const { alerts, loaded, loadError } = notificationAlerts;
  const filteredAlerts: Alert[] = React.useMemo(
    () => alerts?.filter((alert) => filter(alert)),
    [alerts, filter],
  );

  return [filteredAlerts, loaded, loadError];
};

export default useFilteredAlerts;
