import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { MigPlan } from '@kubevirt-utils/resources/migrations/constants';
import { getVMPVCNames } from '@kubevirt-utils/resources/vm/utils/source';
import { Extension, ResolvedExtension } from '@openshift-console/dynamic-plugin-sdk/lib/types';

import { ACMVirtualMachineActionExtension } from './constants';

export const sortMigPlansByCreationTimestamp = (a: MigPlan, b: MigPlan): number =>
  (a?.metadata?.creationTimestamp ?? '')?.localeCompare(b?.metadata?.creationTimestamp ?? '');

export const isVMMigPlan = (migPlan: MigPlan, vmPVCNames: string[]): boolean =>
  migPlan?.spec?.persistentVolumes?.some(
    (pv) =>
      pv?.selection?.action === 'copy' && vmPVCNames?.includes(pv?.pvc?.name?.split(':')?.[0]),
  );

export const getVMMigPlans = (vm: V1VirtualMachine, migPlans: MigPlan[]): MigPlan[] => {
  const vmPVCNames = getVMPVCNames(vm);

  return migPlans?.filter((migPlan) => isVMMigPlan(migPlan, vmPVCNames));
};

export const isACMVirtualMachineActionExtension = (
  e: Extension,
): e is ACMVirtualMachineActionExtension => e.type === 'acm.virtualmachine/action';

export function buildACMVirtualMachineActionsFromExtensions(
  virtualMachine: V1VirtualMachine,
  actionExtensions: ResolvedExtension<ACMVirtualMachineActionExtension>[],
  createModal: (modal: ModalComponent) => void,
): ActionDropdownItemType[] {
  if (!actionExtensions?.length) return [];

  return actionExtensions.map((action) => {
    const ModalComp = action.properties.component as React.ComponentType<any>;
    return {
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <ModalComp
            close={onClose}
            cluster={virtualMachine.cluster}
            isOpen={isOpen}
            resource={virtualMachine}
          />
        )),
      id: action.properties.id,
      label: action.properties.title,
    };
  });
}
