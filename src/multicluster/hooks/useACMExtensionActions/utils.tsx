import React, { ComponentType } from 'react';

import { ACMVirtualMachineAction } from '@kubevirt-extensions/acm.virtualmachine';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { ResolvedExtension } from '@openshift-console/dynamic-plugin-sdk/lib/types';

export function buildACMVirtualMachineActionsFromExtensions(
  virtualMachine: V1VirtualMachine,
  actionExtensions: ResolvedExtension<ACMVirtualMachineAction>[],
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
