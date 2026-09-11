import { type ComponentType } from 'react';

import { PlanModel } from '@forklift-ui/types';
import { type ACMVirtualMachineAction } from '@kubevirt-extensions/acm.virtualmachine';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { type ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { MTV_MIGRATION_NAMESPACE } from '@multicluster/components/CrossClusterMigration/constants';
import { CROSS_CLUSTER_MIGRATION_ACTION_ID } from '@multicluster/constants';
import { type ResolvedExtension } from '@openshift-console/dynamic-plugin-sdk/lib/types';

const resolveActionDisabled = (
  isDisabled: ResolvedExtension<ACMVirtualMachineAction>['properties']['isDisabled'],
  resource: V1VirtualMachine,
): boolean => {
  if (typeof isDisabled === 'function') {
    return isDisabled(resource);
  }

  return Boolean(isDisabled);
};

export function buildACMVirtualMachineActionsFromExtensions(
  virtualMachine: V1VirtualMachine,
  actionExtensions: ResolvedExtension<ACMVirtualMachineAction>[],
  createModal: (modal: ModalComponent) => void,
  hubClusterName: string,
): ActionDropdownItemType[] {
  if (!actionExtensions?.length) return [];

  return actionExtensions.map<ActionDropdownItemType>((action) => {
    const ModalComp = action.properties.component as ComponentType<{
      close: () => void;
      cluster: string;
      isOpen: boolean;
      resource: V1VirtualMachine;
    }>;

    return {
      ...(action.properties.id === CROSS_CLUSTER_MIGRATION_ACTION_ID && {
        accessReview: {
          cluster: virtualMachine?.cluster ?? hubClusterName,
          group: PlanModel.apiGroup,
          namespace: MTV_MIGRATION_NAMESPACE,
          resource: PlanModel.plural,
          verb: 'create',
        },
      }),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <ModalComp
            close={onClose}
            cluster={virtualMachine?.cluster ?? hubClusterName}
            isOpen={isOpen}
            resource={virtualMachine}
          />
        )),
      description: action.properties.description,
      disabled: resolveActionDisabled(action.properties.isDisabled, virtualMachine),
      id: action.properties.id,
      label: action.properties.title as ACMVirtualMachineAction['properties']['title'],
    };
  });
}
