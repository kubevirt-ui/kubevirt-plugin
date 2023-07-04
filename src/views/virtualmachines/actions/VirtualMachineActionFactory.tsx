import * as React from 'react';

import VirtualMachineInstanceMigrationModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceMigrationModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Action, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { CopyIcon } from '@patternfly/react-icons';

import { isLiveMigratable, printableVMStatus } from '../utils';

import CloneVMModal from './components/CloneVMModal/CloneVMModal';
import DeleteVMModal from './components/DeleteVMModal/DeleteVMModal';
import {
  cancelMigration,
  migrateVM,
  pauseVM,
  restartVM,
  startVM,
  stopVM,
  unpauseVM,
} from './actions';

const {
  Migrating,
  Paused,
  Provisioning,
  Running,
  Starting,
  Stopped,
  Stopping,
  Terminating,
  Unknown,
} = printableVMStatus;

export const VirtualMachineActionFactory = {
  cancelMigration: (
    vm: V1VirtualMachine,
    vmim: V1VirtualMachineInstanceMigration,
    isSingleNodeCluster: boolean,
  ): Action => {
    return {
      accessReview: {
        group: VirtualMachineInstanceMigrationModel.apiGroup,
        namespace: vm?.metadata?.namespace,
        resource: VirtualMachineInstanceMigrationModel.plural,
        verb: 'delete',
      },
      cta: () => cancelMigration(vmim),
      description: !!vmim?.metadata?.deletionTimestamp && t('Canceling ongoing migration'),
      disabled: isSingleNodeCluster || !vmim || !!vmim?.metadata?.deletionTimestamp,
      id: 'vm-action-cancel-migrate',
      label: t('Cancel migration'),
    };
  },
  clone: (vm: V1VirtualMachine, createModal: (modal: ModalComponent) => void): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <CloneVMModal isOpen={isOpen} onClose={onClose} vm={vm} />
        )),
      disabled: ![Paused, Running, Stopped].includes(vm?.status?.printableStatus),
      id: 'vm-action-clone',
      label: t('Clone'),
    };
  },
  // },
  copySSHCommand: (vm: V1VirtualMachine, command: string): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () => command && navigator.clipboard.writeText(command),
      description: t('SSH using virtctl'),
      disabled: isEmpty(getVMSSHSecretName(vm)),
      icon: <CopyIcon />,
      id: 'vm-action-copy-ssh',
      label: t('Copy SSH command'),
    };
  },

  delete: (vm: V1VirtualMachine, createModal: (modal: ModalComponent) => void): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'delete'),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <DeleteVMModal isOpen={isOpen} onClose={onClose} vm={vm} />
        )),
      disabled: false,
      id: 'vm-action-delete',
      label: t('Delete'),
    };
  },
  editAnnotations: (vm: V1VirtualMachine, createModal: (modal: ModalComponent) => void): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <AnnotationsModal
            onSubmit={(updatedAnnotations) =>
              k8sPatch({
                data: [
                  {
                    op: 'replace',
                    path: '/metadata/annotations',
                    value: updatedAnnotations,
                  },
                ],
                model: VirtualMachineModel,
                resource: vm,
              })
            }
            isOpen={isOpen}
            obj={vm}
            onClose={onClose}
          />
        )),
      disabled: false,
      id: 'vm-action-edit-annotations',
      label: t('Edit annotations'),
    };
  },
  editLabels: (vm: V1VirtualMachine, createModal: (modal: ModalComponent) => void): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <LabelsModal
            onLabelsSubmit={(labels) =>
              k8sPatch({
                data: [
                  {
                    op: 'replace',
                    path: '/metadata/labels',
                    value: labels,
                  },
                ],
                model: VirtualMachineModel,
                resource: vm,
              })
            }
            isOpen={isOpen}
            obj={vm}
            onClose={onClose}
          />
        )),
      disabled: false,
      id: 'vm-action-edit-labels',
      label: t('Edit labels'),
    };
  },
  forceStop: (vm: V1VirtualMachine): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () =>
        stopVM(vm, {
          gracePeriod: 0,
        }),
      disabled: [Migrating, Provisioning, Stopped, Terminating, Unknown].includes(
        vm?.status?.printableStatus,
      ),
      id: 'vm-action-force-stop',
      label: t('Force stop'),
    };
  },
  migrate: (vm: V1VirtualMachine, isSingleNodeCluster: boolean): Action => {
    return {
      accessReview: {
        group: VirtualMachineInstanceMigrationModel.apiGroup,
        namespace: vm?.metadata?.namespace,
        resource: VirtualMachineInstanceMigrationModel.plural,
        verb: 'create',
      },
      cta: () => migrateVM(vm),
      description: t('Migrate to a different Node'),
      disabled: !isLiveMigratable(vm, isSingleNodeCluster),
      id: 'vm-action-migrate',
      label: t('Migrate'),
    };
  },
  pause: (vm: V1VirtualMachine): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () => pauseVM(vm),
      disabled: vm?.status?.printableStatus !== Running,
      id: 'vm-action-pause',
      label: t('Pause'),
    };
  },
  // console component is needed to allow openConsole action
  // openConsole: (vm: V1VirtualMachine): Action => {
  //   return {
  //     id: 'vm-action-open-console',
  //     disabled: false,
  //     label: 'Open console',
  //     cta: () =>
  //       window.open(
  //         `/k8s/ns/${vm?.metadata?.namespace}/virtualmachineinstances/${vm?.metadata?.name}/standaloneconsole`,
  //         `${vm?.metadata?.name}-console}`,
  //         'modal=yes,alwaysRaised=yes,location=yes,width=1024,height=768',
  //       ),
  //   };
  restart: (vm: V1VirtualMachine): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () => restartVM(vm),
      disabled: [Migrating, Provisioning, Stopped, Stopping, Terminating, Unknown].includes(
        vm?.status?.printableStatus,
      ),
      id: 'vm-action-restart',
      label: t('Restart'),
    };
  },
  start: (vm: V1VirtualMachine): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () => startVM(vm),
      disabled: [
        Migrating,
        Provisioning,
        Running,
        Starting,
        Stopping,
        Terminating,
        Unknown,
      ].includes(vm?.status?.printableStatus),
      id: 'vm-action-start',
      label: t('Start'),
    };
  },
  stop: (vm: V1VirtualMachine): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () => stopVM(vm),
      disabled: [Stopped, Stopping, Terminating, Unknown].includes(vm?.status?.printableStatus),
      id: 'vm-action-stop',
      label: t('Stop'),
    };
  },
  unpause: (vm: V1VirtualMachine): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () => unpauseVM(vm),
      disabled: vm?.status?.printableStatus !== Paused,
      id: 'vm-action-unpause',
      label: t('Unpause'),
    };
  },
};
