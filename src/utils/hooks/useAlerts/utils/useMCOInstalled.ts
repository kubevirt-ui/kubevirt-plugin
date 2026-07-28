import { type TFunction } from 'i18next';

import { isObservabilityCMA } from '@kubevirt-utils/hooks/useVirtualizationObservabilityLink/utils';
import {
  ClusterManagementAddOnModel,
  modelToGroupVersionKind,
  MultiClusterObservabilityModel,
} from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import useIsACMPage from '@multicluster/useIsACMPage';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const getMCONotInstalledTooltip = (t: TFunction): string =>
  t(
    'Multicluster observability is not available. Install it on the hub cluster to enable monitoring across clusters.',
  );

export const getMCOCheckErrorTooltip = (t: TFunction): string =>
  t('Unable to verify multicluster observability status. Metrics may not be available.');

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
 *
 * Detection accepts either a MultiClusterObservability CR or a matching
 * ClusterManagementAddOn (legacy observability-controller or MCOA).
 */
export const useMCOInstalled = (): UseMCOInstalledResult => {
  const isACMPage = useIsACMPage();

  const [mcoResource, mcoLoaded, mcoError] = useK8sWatchData<K8sResourceCommon[]>(
    isACMPage
      ? {
          groupVersionKind: modelToGroupVersionKind(MultiClusterObservabilityModel),
          isList: true,
        }
      : null,
  );

  const [observabilityAddOns, cmaLoaded, cmaError] = useK8sWatchData<K8sResourceCommon[]>(
    isACMPage
      ? {
          groupVersionKind: modelToGroupVersionKind(ClusterManagementAddOnModel),
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

  const hasObservabilityCMA = observabilityAddOns?.some(isObservabilityCMA);
  const mcoInstalled = !isEmpty(mcoResource) || Boolean(hasObservabilityCMA);

  return {
    error: mcoError || cmaError,
    loaded: mcoLoaded && cmaLoaded,
    mcoInstalled,
  };
};

export default useMCOInstalled;
