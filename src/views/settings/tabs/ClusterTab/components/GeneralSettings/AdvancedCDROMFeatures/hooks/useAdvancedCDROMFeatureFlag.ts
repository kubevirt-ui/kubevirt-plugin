import { useState } from 'react';

import { HyperConvergedModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { K8S_OPS } from '@kubevirt-utils/constants/constants';
import useHyperConvergeConfiguration, {
  HyperConverged,
} from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

import { DECLARATIVE_HOTPLUG_VOLUMES_FEATURE_GATE } from './constants';

const updateDeclarativeHotplugVolumesFeatureGate = (
  hcoCR: HyperConverged,
  switchState: boolean,
  cluster?: string,
) => {
  const featureGates = hcoCR.spec?.featureGates;
  const hasGate = featureGates?.hasOwnProperty(DECLARATIVE_HOTPLUG_VOLUMES_FEATURE_GATE);

  return kubevirtK8sPatch<HyperConverged>({
    cluster,
    data: [
      ...(!featureGates ? [{ op: K8S_OPS.ADD, path: '/spec/featureGates', value: {} }] : []),
      {
        op: hasGate ? K8S_OPS.REPLACE : K8S_OPS.ADD,
        path: `/spec/featureGates/${DECLARATIVE_HOTPLUG_VOLUMES_FEATURE_GATE}`,
        value: switchState,
      },
    ],
    model: HyperConvergedModel,
    resource: hcoCR,
  });
};

const useAdvancedCDROMFeatureFlag = (cluster?: string) => {
  const [loading, setLoading] = useState(false);
  const [hyperConvergeConfiguration, hcoLoaded] = useHyperConvergeConfiguration(cluster);
  const isAdmin = useIsAdmin();

  const featureEnabled = Boolean(
    hyperConvergeConfiguration?.spec?.featureGates?.declarativeHotplugVolumes,
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
