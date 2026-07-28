import { TFunction } from 'i18next';

import { OBSERVABILITY_CMA_NAMES } from '@kubevirt-utils/hooks/useVirtualizationObservabilityLink/constants';
import {
  ClusterManagementAddOnModel,
  MultiClusterObservabilityModel,
} from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import useIsACMPage from '@multicluster/useIsACMPage';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

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
 * Detection accepts either:
 * - a MultiClusterObservability CR, or
 * - a ClusterManagementAddOn named observability-controller (legacy) or
 *   multicluster-observability-addon (MCOA) — see CNV-93086.
 */
export const useMCOInstalled = (): UseMCOInstalledResult => {
  const isACMPage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();

  const watchOnHub = isACMPage
    ? {
        cluster: hubClusterName,
      }
    : null;

  const [mcoResource, mcoLoaded, mcoError] = useK8sWatchData<K8sResourceCommon[]>(
    watchOnHub
      ? {
          ...watchOnHub,
          groupVersionKind: {
            group: MultiClusterObservabilityModel.apiGroup,
            kind: MultiClusterObservabilityModel.kind,
            version: MultiClusterObservabilityModel.apiVersion,
          },
          isList: true,
        }
      : null,
  );

  const [observabilityAddOns, cmaLoaded, cmaError] = useK8sWatchData<K8sResourceCommon[]>(
    watchOnHub
      ? {
          ...watchOnHub,
          groupVersionKind: {
            group: ClusterManagementAddOnModel.apiGroup,
            kind: ClusterManagementAddOnModel.kind,
            version: ClusterManagementAddOnModel.apiVersion,
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

  const hasObservabilityCMA = observabilityAddOns?.some((addon) => {
    const name = getName(addon);
    return Boolean(name && (OBSERVABILITY_CMA_NAMES as readonly string[]).includes(name));
  });

  const mcoInstalled = !isEmpty(mcoResource) || Boolean(hasObservabilityCMA);

  return {
    error: mcoError || cmaError,
    loaded: mcoLoaded && cmaLoaded,
    mcoInstalled,
  };
};

export default useMCOInstalled;
