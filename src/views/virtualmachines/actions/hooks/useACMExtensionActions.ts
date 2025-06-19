import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useResolvedExtensions } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import { ACMVirtualMachineActionExtension } from './constants';
import {
  buildACMVirtualMachineActionsFromExtensions,
  isACMVirtualMachineActionExtension,
} from './utils';

const useACMExtensionActions = (vm): ActionDropdownItemType[] => {
  const { createModal } = useModal();
  const hubClusterName = useHubClusterName();
  const [virtualMachineActionExtensions, virtualMachineActionExtensionsResolved] =
    useResolvedExtensions<ACMVirtualMachineActionExtension>(isACMVirtualMachineActionExtension);

  return buildACMVirtualMachineActionsFromExtensions(
    vm,
    virtualMachineActionExtensionsResolved ? virtualMachineActionExtensions : [],
    createModal,
    hubClusterName,
  );
};

export default useACMExtensionActions;
