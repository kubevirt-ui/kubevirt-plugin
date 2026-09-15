import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

/**
 * Checks whether the current user can edit a VirtualMachine.
 * Requires both update and patch permissions.
 */
const useEditVMAccessReview = (vm?: V1VirtualMachine): boolean => {
  const updateAccessReview = asAccessReview(VirtualMachineModel, vm as K8sResourceCommon, 'update');
  const patchAccessReview = asAccessReview(VirtualMachineModel, vm as K8sResourceCommon, 'patch');

  const [canUpdateVM, canUpdateLoading] = useFleetAccessReview(updateAccessReview ?? {});
  const [canPatchVM, canPatchLoading] = useFleetAccessReview(patchAccessReview ?? {});

  const isLoading = !vm || canUpdateLoading || canPatchLoading;
  const isEditable = canUpdateVM && canPatchVM;

  if (isLoading) {
    return false;
  }

  return isEditable;
};

export default useEditVMAccessReview;
