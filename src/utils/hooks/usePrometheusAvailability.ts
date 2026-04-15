import { getCluster } from '@multicluster/helpers/selectors';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import useMCOInstalled from './useAlerts/utils/useMCOInstalled';

type UsePrometheusAvailabilityResult = {
  mcoError: Error | unknown;
  mcoLoaded: boolean;
  prometheusUnavailable: boolean;
};

export const usePrometheusAvailability = (
  resource?: K8sResourceCommon,
): UsePrometheusAvailabilityResult => {
  const { error: mcoError, loaded: mcoLoaded, mcoInstalled } = useMCOInstalled();
  const [hubClusterName, hubClusterLoaded] = useHubClusterName();

  const cluster = getCluster(resource);
  const isSpoke = hubClusterLoaded && !!cluster && cluster !== hubClusterName;
  const prometheusUnavailable = mcoLoaded && isSpoke && !mcoInstalled;

  return { mcoError, mcoLoaded, prometheusUnavailable };
};
