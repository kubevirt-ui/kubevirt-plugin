import { useDashboardResources } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Alert } from '@openshift-console/dynamic-plugin-sdk-internal/lib/api/common-types';

type UseAlerts = () => { alerts: Alert[]; loaded: boolean; loadError: Error };

const useAlerts: UseAlerts = () => {
  const { notificationAlerts } = useDashboardResources({});
  return notificationAlerts;
};

export default useAlerts;
