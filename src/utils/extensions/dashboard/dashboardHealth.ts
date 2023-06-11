import { HCOHealthStatus } from '@kubevirt-utils/extensions/dashboard/types';
import { HealthState, PrometheusHealthHandler } from '@openshift-console/dynamic-plugin-sdk';

export const getKubevirtHealthState: PrometheusHealthHandler = (responses) => {
  const { error, response } = responses?.[0];

  if (error) {
    return { state: HealthState.NOT_AVAILABLE };
  }

  if (!response) {
    return { state: HealthState.LOADING };
  }

  const hcoHealthStatus = parseInt(response?.data?.result?.[0]?.value?.[1]);

  switch (hcoHealthStatus) {
    case HCOHealthStatus.none:
      return { state: HealthState.OK };
    case HCOHealthStatus.warning:
      return { state: HealthState.WARNING };
    case HCOHealthStatus.critical:
    default:
      return { state: HealthState.ERROR };
  }
};
