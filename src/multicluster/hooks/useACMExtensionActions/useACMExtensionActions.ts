import { useMemo } from 'react';

import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useResolvedExtensions } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import { ACMVirtualMachineActionExtension } from './constants';
import {
  buildACMVirtualMachineActionsFromExtensions,
  isACMVirtualMachineActionExtension,
} from './utils';

const useACMExtensionActions = (vm): ActionDropdownItemType[] => {
  const { createModal } = useModal();
  const isACMPage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();
  const [virtualMachineActionExtensions, virtualMachineActionExtensionsResolved] =
    useResolvedExtensions<ACMVirtualMachineActionExtension>(isACMVirtualMachineActionExtension);

  return useMemo(() => {
    if (!isACMPage) return [];
    return buildACMVirtualMachineActionsFromExtensions(
      vm,
      virtualMachineActionExtensionsResolved ? virtualMachineActionExtensions : [],
      createModal,
      hubClusterName,
    );
  }, [vm, virtualMachineActionExtensionsResolved, createModal, hubClusterName]);
};

export default useACMExtensionActions;
