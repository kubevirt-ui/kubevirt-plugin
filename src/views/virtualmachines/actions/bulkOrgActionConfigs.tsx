import React from 'react';
import { type TFunction } from 'i18next';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { type ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MoveBulkVMToFolderModal from '@kubevirt-utils/components/MoveVMToFolderModal/MoveBulkVMsToFolderModal';
import RunStrategyModal from '@kubevirt-utils/components/RunStrategyModal/RunStrategyModal';
import { updateRunStrategy } from '@kubevirt-utils/components/RunStrategyModal/utils';
import { getNamespace, haveSameCluster, haveSameNamespace } from '@kubevirt-utils/resources/shared';
import {
  getEffectiveRunStrategy,
  isVMNotStopped,
} from '@kubevirt-utils/resources/vm/utils/selectors';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

import { isStopped } from '../utils';

import { BULK_ACTIONS_ID } from './hooks/constants';

export const createEditRunStrategyConfig =
  (t: TFunction) =>
  (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => ({
    accessReview: {
      cluster: getCluster(vms?.[0]),
      group: VirtualMachineModel.apiGroup,
      namespace: getNamespace(vms?.[0]),
      resource: VirtualMachineModel.plural,
      verb: 'patch',
    },
    cta: (): void => {
      const effectiveStrategies = vms.map(getEffectiveRunStrategy);
      const allSameStrategy = effectiveStrategies.every(
        (statusItem) => statusItem === effectiveStrategies[0],
      );
      createModal(({ isOpen, onClose }) => (
        <RunStrategyModal
          hasMixedStrategies={!allSameStrategy}
          hasStoppedVMs={vms.some(isStopped)}
          initialRunStrategy={allSameStrategy ? effectiveStrategies[0] : undefined}
          isOpen={isOpen}
          isVMRunning={vms.some(isVMNotStopped)}
          onClose={onClose}
          // eslint-disable-next-line -- sonarjs/no-nested-functions
          onSubmit={async (runStrategy) => {
            const results = await Promise.allSettled(
              vms.map((vm) => updateRunStrategy(vm, runStrategy)),
            );
            const failures = results.filter(
              (res): res is PromiseRejectedResult => res.status === 'rejected',
            );
            if (failures.length > 0) {
              for (const result of failures)
                kubevirtConsole.error('Failed to update run strategy:', result.reason);
              throw new Error(
                `Failed to update run strategy for ${failures.length} of ${vms.length} VirtualMachine(statusItem)`,
              );
            }
          }}
          vmCount={vms.length}
        />
      ));
    },
    disabled: isEmpty(vms),
    id: BULK_ACTIONS_ID.EDIT_RUN_STRATEGY,
    label: t('Edit run strategy'),
  });

export const createMoveToFolderConfig =
  (t: TFunction) =>
  (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => ({
    cta: () =>
      createModal(({ isOpen, onClose }) => (
        <MoveBulkVMToFolderModal
          isOpen={isOpen}
          onClose={onClose}
          // eslint-disable-next-line -- sonarjs/no-nested-functions
          onSubmit={(folderName) => {
            return Promise.all(
              vms.map((vm) => {
                const labels = vm?.metadata?.labels ?? {};
                labels[VM_FOLDER_LABEL] = folderName;
                return kubevirtK8sPatch<V1VirtualMachine>({
                  data: [
                    {
                      op: 'replace',
                      path: '/metadata/labels',
                      value: labels,
                    },
                  ],
                  model: VirtualMachineModel,
                  resource: vm,
                });
              }),
            );
          }}
          vms={vms}
        />
      )),
    disabled: !haveSameCluster(vms) || !haveSameNamespace(vms) || isEmpty(vms),
    id: BULK_ACTIONS_ID.MOVE_TO_FOLDER,
    label: t('Move to group'),
  });
