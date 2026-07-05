import { useMemo } from 'react';

import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';
import useClusterParam from '@multicluster/hooks/useClusterParam';

import { VSOCK_FEATURE_GATE } from './constants';

type UseIsVSOCKFeatureEnabled = (clusterOverride?: string) => {
  featureEnabled: boolean;
  isLoading: boolean;
};

const useIsVSOCKFeatureEnabled: UseIsVSOCKFeatureEnabled = (clusterOverride) => {
  const clusterParam = useClusterParam();
  const cluster = clusterOverride || clusterParam;

  const { featureGates, hcLoaded } = useKubevirtHyperconvergeConfiguration(cluster);

  const featureEnabled = useMemo(
    () => Boolean(featureGates?.includes(VSOCK_FEATURE_GATE)),
    [featureGates],
  );

  return { featureEnabled, isLoading: !hcLoaded };
};

export default useIsVSOCKFeatureEnabled;
