import { useMatch } from 'react-router';

import {
  VirtualMachineTemplateModelRef,
  VirtualMachineTemplateV1Alpha1ModelRef,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { FLEET_TEMPLATES_VMT_DETAILS_PATH } from '@multicluster/constants/templateConstants';
import { VMT_VM_TEMPLATES_DETAILS_PATH } from '@templates/constants';

/**
 * Returns true when the current URL matches a VirtualMachineTemplate (VMT)
 * details route rather than a regular OpenShift Template details route.
 *
 * Covers the custom `/vm-templates/vmt/` routes (single-cluster and fleet)
 * as well as the Console SDK `resource/details` routes for the
 * VirtualMachineTemplate CRD (v1beta1 and v1alpha1).
 */
const useIsVMTRoute = (): boolean => {
  const singleClusterMatch = useMatch(`${VMT_VM_TEMPLATES_DETAILS_PATH}/*`);
  const fleetMatch = useMatch(`${FLEET_TEMPLATES_VMT_DETAILS_PATH}/*`);
  const resourceV1Beta1Match = useMatch(`/k8s/ns/:ns/${VirtualMachineTemplateModelRef}/:name/*`);
  const resourceV1Alpha1Match = useMatch(
    `/k8s/ns/:ns/${VirtualMachineTemplateV1Alpha1ModelRef}/:name/*`,
  );

  return Boolean(singleClusterMatch ?? fleetMatch ?? resourceV1Beta1Match ?? resourceV1Alpha1Match);
};

export default useIsVMTRoute;
