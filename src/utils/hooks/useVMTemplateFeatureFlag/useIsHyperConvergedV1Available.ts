import { HyperConvergedV1ModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { isManagedSpokeCluster } from '@multicluster/helpers/isManagedSpokeCluster';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import useHyperConvergedAPIDiscovery from './useHyperConvergedAPIDiscovery';

type HCOV1Availability = {
  isHCOV1: boolean;
  loading: boolean;
};

type UseIsHyperConvergedV1Available = (clusterOverride?: string) => HCOV1Availability;

/**
 * HCO v1 exposes slice-based featureGates (Template is Beta / first-class).
 * HCO v1beta1 still needs the Preview Features jsonpatch toggle.
 *
 * Hub / local: useK8sModel for HyperConverged v1.
 * Managed clusters: API discovery preferredVersion via useHyperConvergedAPIDiscovery.
 */
const useIsHyperConvergedV1Available: UseIsHyperConvergedV1Available = (clusterOverride) => {
  const clusterParam = useClusterParam();
  const cluster = clusterOverride ?? clusterParam;
  const [hubClusterName, hubLoaded, hubError] = useHubClusterName() as [
    string | undefined,
    boolean,
    unknown,
  ];

  const isManagedCluster = isManagedSpokeCluster(cluster, hubClusterName, hubLoaded);

  const [hcoV1Model, inFlight] = useK8sModel(HyperConvergedV1ModelGroupVersionKind);
  const { loading: discoveryLoading, preferredVersion } = useHyperConvergedAPIDiscovery(
    isManagedCluster ? cluster : undefined,
  );

  if (cluster && !hubLoaded && !hubError) {
    return { isHCOV1: false, loading: true };
  }

  if (isManagedCluster) {
    return {
      isHCOV1: preferredVersion === HyperConvergedV1ModelGroupVersionKind.version,
      loading: discoveryLoading,
    };
  }

  return {
    isHCOV1: !inFlight && !isEmpty(hcoV1Model),
    loading: inFlight,
  };
};

export default useIsHyperConvergedV1Available;
