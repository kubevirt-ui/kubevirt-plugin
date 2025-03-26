import React, { useMemo } from 'react';
import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { CONFIRM_VM_ACTIONS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';
import ConfirmMultipleVMActionsModal from '@virtualmachines/actions/components/ConfirmMultipleVMActionsModal/ConfirmMultipleVMActionsModal';
import { isPaused, isRunning, isStopped } from '@virtualmachines/utils';

import { pauseVM, restartVM, startVM, stopVM, unpauseVM } from '../actions';
import { MigPlanModel } from '../components/VirtualMachineMigration/constants';
import VirtualMachineMigrateModal from '../components/VirtualMachineMigration/VirtualMachineMigrationModal';

import { ACTIONS_ID } from './constants';

type UseMultipleVirtualMachineActions = (vms: V1VirtualMachine[]) => ActionDropdownItemType[];

const useMultipleVirtualMachineActions: UseMultipleVirtualMachineActions = (vms) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { featureEnabled: confirmVMActionsEnabled } = useFeatures(CONFIRM_VM_ACTIONS);

  const [migPlan] = useK8sModel(modelToGroupVersionKind(MigPlanModel));

  const mtcInstalled = !isEmpty(migPlan);

  return useMemo(() => {
    const namespaces = new Set(vms?.map((vm) => getNamespace(vm)));

    const actions: ActionDropdownItemType[] = [
      {
        cta: () => vms.forEach(startVM),
        id: ACTIONS_ID.START,
        label: t('Start'),
      },
      {
        cta: () =>
          confirmVMActionsEnabled
            ? createModal(({ isOpen, onClose }) => (
                <ConfirmMultipleVMActionsModal
                  action={restartVM}
                  actionType="Restart"
                  isOpen={isOpen}
                  onClose={onClose}
                  vms={vms}
                />
              ))
            : vms.forEach(restartVM),
        id: ACTIONS_ID.RESTART,
        label: t('Restart'),
      },
      {
        cta: () => {
          confirmVMActionsEnabled
            ? createModal(({ isOpen, onClose }) => (
                <ConfirmMultipleVMActionsModal
                  action={stopVM}
                  actionType="Stop"
                  isOpen={isOpen}
                  onClose={onClose}
                  vms={vms}
                />
              ))
            : vms.forEach((vm) => stopVM(vm));
        },
        id: ACTIONS_ID.STOP,
        label: t('Stop'),
      },
      {
        cta: () =>
          confirmVMActionsEnabled
            ? createModal(({ isOpen, onClose }) => (
                <ConfirmMultipleVMActionsModal
                  action={pauseVM}
                  actionType="Pause"
                  isOpen={isOpen}
                  onClose={onClose}
                  vms={vms}
                />
              ))
            : vms.forEach(pauseVM),
        id: ACTIONS_ID.PAUSE,
        label: t('Pause'),
      },
      {
        cta: () => vms.forEach(unpauseVM),
        id: ACTIONS_ID.UNPAUSE,
        label: t('Unpause'),
      },
    ];

    if (namespaces.size === 1 && mtcInstalled) {
      actions.push({
        accessReview: {
          group: VirtualMachineModel.apiGroup,
          namespace: getNamespace(vms?.[0]),
          resource: VirtualMachineModel.plural,
          verb: 'patch',
        },
        cta: () => createModal((props) => <VirtualMachineMigrateModal vms={vms} {...props} />),
        description: t('Migrate VirtualMachine storage to a different StorageClass'),
        id: 'vms-bulk-migrate-storage',
        label: t('Migrate storage'),
      });
    }

    if (vms.every(isStopped)) {
      return actions.filter((action) => action.id !== ACTIONS_ID.STOP);
    }

    if (vms.every(isRunning)) {
      return actions.filter((action) => action.id !== ACTIONS_ID.START);
    }

    if (vms.every(isPaused)) {
      return actions.filter((action) => action.id !== ACTIONS_ID.PAUSE);
    }

    return actions;
  }, [confirmVMActionsEnabled, createModal, t, vms, mtcInstalled]);
};

export default useMultipleVirtualMachineActions;
