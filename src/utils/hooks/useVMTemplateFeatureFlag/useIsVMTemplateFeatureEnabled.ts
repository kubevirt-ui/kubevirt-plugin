import { useMemo } from 'react';

import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';
import useClusterParam from '@multicluster/hooks/useClusterParam';

import { TEMPLATE_FEATURE_GATE } from './constants';

type UseIsVMTemplateFeatureEnabled = (clusterOverride?: string) => {
  featureEnabled: boolean;
  loading: boolean;
};

const useIsVMTemplateFeatureEnabled: UseIsVMTemplateFeatureEnabled = (clusterOverride) => {
  const clusterParam = useClusterParam();
  const cluster = clusterOverride || clusterParam;

  const { featureGates, hcLoaded } = useKubevirtHyperconvergeConfiguration(cluster);

  const featureEnabled = useMemo(
    () => featureGates?.includes(TEMPLATE_FEATURE_GATE) ?? false,
    [featureGates],
  );

  return { featureEnabled, loading: !hcLoaded };
};

export default useIsVMTemplateFeatureEnabled;
