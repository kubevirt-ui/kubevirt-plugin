import { useState } from 'react';

import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { type HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { buildFeatureGatePatches } from '@kubevirt-utils/resources/hyperconverged/featureGates';
import { getHyperConvergedModelFromResource } from '@kubevirt-utils/resources/hyperconverged/model';
import { isFeatureGateEnabled } from '@kubevirt-utils/resources/hyperconverged/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

import { DECLARATIVE_HOTPLUG_VOLUMES_FEATURE_GATE } from './constants';

type AdvancedCDROMFeatureFlag = {
  canEdit: boolean;
  featureEnabled: boolean;
  loading: boolean;
  toggleFeature: (val: boolean) => Promise<HyperConverged | undefined>;
};

const updateDeclarativeHotplugVolumesFeatureGate = (
  hcoCR: HyperConverged,
  switchState: boolean,
  cluster?: string,
): Promise<HyperConverged> =>
  kubevirtK8sPatch<HyperConverged>({
    cluster,
    data: buildFeatureGatePatches(hcoCR, DECLARATIVE_HOTPLUG_VOLUMES_FEATURE_GATE, switchState),
    model: getHyperConvergedModelFromResource(hcoCR),
    resource: hcoCR,
  });

const useAdvancedCDROMFeatureFlag = (cluster?: string): AdvancedCDROMFeatureFlag => {
  const [loading, setLoading] = useState(false);
  const [hyperConvergeConfiguration, hcoLoaded] = useHyperConvergeConfiguration(cluster);
  const isAdmin = useIsAdmin();

  const featureEnabled = isFeatureGateEnabled(
    hyperConvergeConfiguration,
    DECLARATIVE_HOTPLUG_VOLUMES_FEATURE_GATE,
  );

  return {
    canEdit: isAdmin,
    featureEnabled,
    loading: !hcoLoaded || loading,
    toggleFeature: async (val: boolean): Promise<HyperConverged> => {
      if (!hyperConvergeConfiguration) {
        return;
      }
      setLoading(true);
      try {
        return await updateDeclarativeHotplugVolumesFeatureGate(
          hyperConvergeConfiguration,
          val,
          cluster,
        );
      } finally {
        setLoading(false);
      }
    },
  };
};

export default useAdvancedCDROMFeatureFlag;
