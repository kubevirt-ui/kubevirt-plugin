import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { HYPERCONVERGED_V1_GROUP_VERSION_KIND } from './constants';

/**
 * HCO v1 exposes slice-based featureGates (Template is Beta / first-class).
 * HCO v1beta1 still needs the Preview Features jsonpatch toggle.
 */
const useIsHyperConvergedV1Available = (): { isHCOV1: boolean; loading: boolean } => {
  const [hcoV1Model, inFlight] = useK8sModel(HYPERCONVERGED_V1_GROUP_VERSION_KIND);

  return {
    isHCOV1: !inFlight && !isEmpty(hcoV1Model),
    loading: inFlight,
  };
};

export default useIsHyperConvergedV1Available;
