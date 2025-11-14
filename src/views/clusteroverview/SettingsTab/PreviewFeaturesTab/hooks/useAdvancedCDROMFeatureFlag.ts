import { useState } from 'react';

import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import { K8S_OPS } from '@kubevirt-utils/constants/constants';
import useHyperConvergeConfiguration, {
  HyperConverged,
} from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { DECLARATIVE_HOTPLUG_VOLUMES_FEATURE_GATE } from './constants';

const updateDeclarativeHotplugVolumesFeatureGate = (hcoCR: HyperConverged, switchState: boolean) =>
  k8sPatch<HyperConverged>({
    data: [
      {
        op: K8S_OPS.REPLACE,
        path: `/spec/featureGates/${DECLARATIVE_HOTPLUG_VOLUMES_FEATURE_GATE}`,
        value: switchState,
      },
    ],
    model: HyperConvergedModel,
    resource: hcoCR,
  });

const useAdvancedCDROMFeatureFlag = () => {
  const [loading, setLoading] = useState(false);
  const [hyperConvergeConfiguration, hcoLoaded] = useHyperConvergeConfiguration();
  const isAdmin = useIsAdmin();

  const featureEnabled = Boolean(
    hyperConvergeConfiguration?.spec?.featureGates?.[DECLARATIVE_HOTPLUG_VOLUMES_FEATURE_GATE],
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
      await updateDeclarativeHotplugVolumesFeatureGate(hyperConvergeConfiguration, val);
      setLoading(false);
    },
  };
};

export default useAdvancedCDROMFeatureFlag;
