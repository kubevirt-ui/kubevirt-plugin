import { useMemo } from 'react';

import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';
import useClusterParam from '@multicluster/hooks/useClusterParam';

import { isTemplateFeatureGateEnabled } from './utils';

type UseIsVMTemplateFeatureEnabled = (clusterOverride?: string) => {
  featureEnabled: boolean;
  loading: boolean;
};

const useIsVMTemplateFeatureEnabled: UseIsVMTemplateFeatureEnabled = (clusterOverride) => {
  const clusterParam = useClusterParam();
  const cluster = clusterOverride ?? clusterParam;

  const { disabledFeatureGates, featureGates, hcLoaded } =
    useKubevirtHyperconvergeConfiguration(cluster);

  const featureEnabled = useMemo(
    () => isTemplateFeatureGateEnabled(featureGates, disabledFeatureGates),
    [disabledFeatureGates, featureGates],
  );

  return { featureEnabled, loading: !hcLoaded };
};

export default useIsVMTemplateFeatureEnabled;
