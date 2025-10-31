import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import { HotPlugFeatures } from '@kubevirt-utils/components/DiskModal/utils/constants';
import { isDeclarativeHotplugVolumesEnabled } from '@kubevirt-utils/components/DiskModal/utils/helpers';
import useHyperConvergeConfiguration, {
  HyperConverged,
} from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration.ts';
import { k8sPatch, Patch } from '@openshift-console/dynamic-plugin-sdk';

const JSONPATCH_ANNOTATION = 'kubevirt.kubevirt.io/jsonpatch';

const useAdvancedCDROMFeatureFlag = () => {
  const [hyperConvergeConfiguration, hcoLoaded] = useHyperConvergeConfiguration();
  const {
    featureGates,
    hcConfig: kubevirtConfig,
    hcLoaded: kubevirtLoaded,
  } = useKubevirtHyperconvergeConfiguration();
  const isAdmin = useIsAdmin();

  const featureEnabled = isDeclarativeHotplugVolumesEnabled(featureGates);

  const patchHyperConvergedCR = async (val: boolean) => {
    if (!hyperConvergeConfiguration?.metadata?.name || !kubevirtConfig) {
      return;
    }

    const featureGateIndex = featureGates?.indexOf(HotPlugFeatures.DeclarativeHotplugVolumes) ?? -1;

    const patchOperations = [];

    if (val && featureGateIndex === -1) {
      patchOperations.push({
        op: 'add',
        path: '/spec/configuration/developerConfiguration/featureGates/-',
        value: HotPlugFeatures.DeclarativeHotplugVolumes,
      });
    }

    if (!val && featureGateIndex !== -1) {
      patchOperations.push({
        op: 'remove',
        path: `/spec/configuration/developerConfiguration/featureGates/${featureGateIndex}`,
      });
    }

    if (patchOperations.length === 0) {
      return;
    }

    const jsonPatchValue = JSON.stringify(patchOperations);

    const patch: Patch[] = [
      {
        op: patchOperations[0].op,
        path: `/metadata/annotations/${JSONPATCH_ANNOTATION.replaceAll('/', '~1')}`,
        value: jsonPatchValue,
      },
    ];

    return k8sPatch({
      data: patch,
      model: HyperConvergedModel,
      resource: hyperConvergeConfiguration,
    });
  };

  return {
    canEdit: isAdmin,
    featureEnabled,
    loading: !hcoLoaded || !kubevirtLoaded,
    toggleFeature: async (val: boolean): Promise<HyperConverged> => {
      return patchHyperConvergedCR(val);
    },
  };
};

export default useAdvancedCDROMFeatureFlag;
