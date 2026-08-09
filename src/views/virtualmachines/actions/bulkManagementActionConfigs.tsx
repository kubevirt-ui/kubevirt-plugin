import React from 'react';
import { type TFunction } from 'i18next';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { type ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import BulkSnapshotModal from '@kubevirt-utils/components/SnapshotModal/BulkSnapshotModal';
import SnapshotModal from '@kubevirt-utils/components/SnapshotModal/SnapshotModal';
import { getLabels } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import DeleteAllVMsConfirmationModal from '@virtualmachines/actions/components/DeleteAllConfirmationModal/DeleteAllVMsConfirmationModal';

import { ACTIONS_ID, BULK_ACTIONS_ID } from './hooks/constants';
import {
  getBulkDeleteActionDescription,
  getCommonLabels,
  getLabelsDiffPatch,
  isBulkDeleteActionDisabled,
} from './utils';

export const createControlActionsConfig =
  (t: TFunction) =>
  (controlActions: ActionDropdownItemType[]): ActionDropdownItemType => ({
    cta: null,
    id: ACTIONS_ID.CONTROL_MENU,
    label: t('Control'),
    options: controlActions,
  });

export const createDeleteConfig =
  (t: TFunction) =>
  (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    isTreeViewAction: boolean,
  ): ActionDropdownItemType => ({
    cta: () =>
      createModal(({ isOpen, onClose }) => (
        <DeleteAllVMsConfirmationModal isOpen={isOpen} onClose={onClose} vms={vms} />
      )),
    description: getBulkDeleteActionDescription(vms, t),
    disabled: isBulkDeleteActionDisabled(vms),
    id: BULK_ACTIONS_ID.DELETE,
    label: isTreeViewAction ? t('Delete all VMs') : t('Delete'),
  });

export const createEditLabelsConfig =
  (t: TFunction) =>
  (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    isTreeViewAction: boolean,
  ): ActionDropdownItemType => ({
    cta: (): void => {
      const commonLabels = getCommonLabels(vms);

      createModal(({ isOpen, onClose }) => (
        <LabelsModal
          initialLabels={commonLabels}
          isOpen={isOpen}
          obj={vms?.[0]}
          onClose={onClose}
          // eslint-disable-next-line -- sonarjs/no-nested-functions
          onLabelsSubmit={(newLabels) => {
            return Promise.all(
              vms.map((vm) =>
                kubevirtK8sPatch<V1VirtualMachine>({
                  data: getLabelsDiffPatch(newLabels, commonLabels, getLabels(vm)),
                  model: VirtualMachineModel,
                  resource: vm,
                }),
              ),
            );
          }}
        />
      ));
    },
    disabled: isEmpty(vms),
    id: BULK_ACTIONS_ID.EDIT_LABELS,
    label: isTreeViewAction ? t('Edit VM labels') : t('Edit labels'),
  });

export const createSnapshotConfig =
  (t: TFunction) =>
  (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => ({
    cta: () =>
      createModal((props) =>
        vms.length === 1 ? (
          <SnapshotModal vm={vms[0]} {...props} />
        ) : (
          <BulkSnapshotModal vms={vms} {...props} />
        ),
      ),
    id: BULK_ACTIONS_ID.SNAPSHOT,
    label: t('Take snapshot'),
  });
