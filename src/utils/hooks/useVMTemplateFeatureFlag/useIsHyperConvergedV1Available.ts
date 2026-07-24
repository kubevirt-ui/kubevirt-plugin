import { HyperConvergedV1ModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

/**
 * HCO v1 exposes slice-based featureGates (Template is Beta / first-class).
 * HCO v1beta1 still needs the Preview Features jsonpatch toggle.
 * Detection only — all HCO watch/patch paths use v1beta1.
 */
const useIsHyperConvergedV1Available = (): { isHCOV1: boolean; loading: boolean } => {
  const [hcoV1Model, inFlight] = useK8sModel(HyperConvergedV1ModelGroupVersionKind);

  return {
    isHCOV1: !inFlight && !isEmpty(hcoV1Model),
    loading: inFlight,
  };
};

export default useIsHyperConvergedV1Available;
