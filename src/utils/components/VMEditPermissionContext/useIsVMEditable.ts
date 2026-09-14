import { useContext } from 'react';

import { VMEditPermissionContext } from './VMEditPermissionContext';

/**
 * Returns whether the current user can edit the VM.
 * Reads from VMEditPermissionContext, which is filled by useEditVMAccessReview in the VirtualMachineNavPage component.
 *
 * When no VMEditPermissionProvider is present (e.g. inside the creation wizard),
 * the context default is `true`, so components remain fully editable.
 */
const useIsVMEditable = (): boolean => {
  const isEditable = useContext(VMEditPermissionContext);
  return isEditable;
};

export default useIsVMEditable;
