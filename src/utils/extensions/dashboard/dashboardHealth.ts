import { HealthState } from '@openshift-console/dynamic-plugin-sdk';
import { URLHealthHandler } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/dashboard-types';

type KubevirtHealthResponse = {
  apiserver: {
    connectivity: string;
  };
};

export const getKubevirtHealthState: URLHealthHandler<KubevirtHealthResponse> = (
  response,
  error,
) => {
  if (error) {
    return { state: HealthState.NOT_AVAILABLE };
  }
  if (!response) {
    return { state: HealthState.LOADING };
  }
  return response?.apiserver?.connectivity === 'ok'
    ? { state: HealthState.OK }
    : { state: HealthState.ERROR };
};
