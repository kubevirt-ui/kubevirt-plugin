import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';

import ConfirmMultipleVMActionsModal from './components/ConfirmMultipleVMActionsModal/ConfirmMultipleVMActionsModal';

type ConfirmableBulkLifecycleCtaParams = {
  action: (vm: V1VirtualMachine) => Promise<string | void>;
  actionType: string;
  checkToConfirmMessage?: string;
  confirmVMActionsEnabled: boolean;
  createModal: (modal: ModalComponent) => void;
  severityVariant?: 'danger' | 'warning';
  vms: V1VirtualMachine[];
};

export const createConfirmableBulkLifecycleCta =
  ({
    action,
    actionType,
    checkToConfirmMessage,
    confirmVMActionsEnabled,
    createModal,
    severityVariant,
    vms,
  }: ConfirmableBulkLifecycleCtaParams): (() => void) =>
  () => {
    if (confirmVMActionsEnabled) {
      createModal(({ isOpen, onClose }) => (
        <ConfirmMultipleVMActionsModal
          action={action}
          actionType={actionType}
          checkToConfirmMessage={checkToConfirmMessage}
          isOpen={isOpen}
          onClose={onClose}
          severityVariant={severityVariant}
          vms={vms}
        />
      ));
      return;
    }

    for (const vm of vms) void action(vm);
  };
