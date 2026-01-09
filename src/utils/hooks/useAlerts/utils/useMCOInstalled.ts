import { TFunction } from 'react-i18next';

import { MultiClusterObservabilityModel } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import useIsACMPage from '@multicluster/useIsACMPage';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

export const getMCONotInstalledTooltip = (t: TFunction): string =>
  t('Multicluster observability is not installed on the hub cluster');

type UseMCOInstalledResult = {
  error: Error | unknown;
  loaded: boolean;
  mcoInstalled: boolean;
};

/**
 * Hook to check if Multicluster Observability (MCO) is installed on the hub cluster.
 * MCO is required for fleet-wide Prometheus metrics polling.
 * When MCO is not installed, only the hub cluster should be shown and spoke clusters
 * should be disabled with a tooltip.
 */
export const useMCOInstalled = (): UseMCOInstalledResult => {
  const isACMPage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();

  const [mcoResource, loaded, error] = useK8sWatchData<K8sResourceCommon[]>(
    isACMPage
      ? {
          cluster: hubClusterName,
          groupVersionKind: {
            group: MultiClusterObservabilityModel.apiGroup,
            kind: MultiClusterObservabilityModel.kind,
            version: MultiClusterObservabilityModel.apiVersion,
          },
          isList: true,
        }
      : null,
  );

  if (!isACMPage) {
    return {
      error: undefined,
      loaded: true,
      mcoInstalled: true,
    };
  }
  const mcoInstalled = !isEmpty(mcoResource);

  return {
    error,
    loaded,
    mcoInstalled,
  };
};

export default useMCOInstalled;
