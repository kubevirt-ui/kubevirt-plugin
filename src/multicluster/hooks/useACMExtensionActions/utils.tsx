import React, { ComponentType } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { Extension, ResolvedExtension } from '@openshift-console/dynamic-plugin-sdk/lib/types';

import { ACMVirtualMachineActionExtension } from './constants';

export const isACMVirtualMachineActionExtension = (
  e: Extension,
): e is ACMVirtualMachineActionExtension => e.type === 'acm.virtualmachine/action';

export function buildACMVirtualMachineActionsFromExtensions(
  virtualMachine: V1VirtualMachine,
  actionExtensions: ResolvedExtension<ACMVirtualMachineActionExtension>[],
  createModal: (modal: ModalComponent) => void,
  hubClusterName: string,
): ActionDropdownItemType[] {
  if (!actionExtensions?.length) return [];

  return actionExtensions.map((action) => {
    const ModalComp = action.properties.component as ComponentType<any>;
    return {
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <ModalComp
            close={onClose}
            cluster={virtualMachine?.cluster || hubClusterName}
            isOpen={isOpen}
            resource={virtualMachine}
          />
        )),
      description: action.properties.description,
      disabled:
        typeof action.properties.isDisabled === 'function'
          ? action.properties.isDisabled(virtualMachine)
          : action.properties.isDisabled,
      id: action.properties.id,
      label: action.properties.title,
    };
  });
}
