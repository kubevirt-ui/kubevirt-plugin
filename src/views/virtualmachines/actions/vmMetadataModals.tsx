// Extracted from VirtualMachineActionFactory.tsx
// Root: src/views/virtualmachines/actions/VirtualMachineActionFactory.tsx

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { type ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import RunStrategyModal from '@kubevirt-utils/components/RunStrategyModal/RunStrategyModal';
import { updateRunStrategy } from '@kubevirt-utils/components/RunStrategyModal/utils';
import {
  getEffectiveRunStrategy,
  isVMNotStopped,
} from '@kubevirt-utils/resources/vm/utils/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

import MoveVMToFolderModal from '../../../utils/components/MoveVMToFolderModal/MoveVMToFolderModal';

export const openLabelsModal = (
  vm: V1VirtualMachine,
  createModal: (modal: ModalComponent) => void,
): void => {
  createModal(({ isOpen, onClose }) => (
    <LabelsModal
      isOpen={isOpen}
      obj={vm}
      onClose={onClose}
      onLabelsSubmit={(labels): Promise<V1VirtualMachine> =>
        kubevirtK8sPatch({
          data: [{ op: 'replace', path: '/metadata/labels', value: labels }],
          model: VirtualMachineModel,
          resource: vm,
        })
      }
    />
  ));
};

export const openRunStrategyModal = (
  vm: V1VirtualMachine,
  createModal: (modal: ModalComponent) => void,
): void => {
  createModal(({ isOpen, onClose }) => (
    <RunStrategyModal
      initialRunStrategy={getEffectiveRunStrategy(vm)}
      isOpen={isOpen}
      isVMRunning={isVMNotStopped(vm)}
      onClose={onClose}
      onSubmit={(runStrategy): Promise<V1VirtualMachine> => updateRunStrategy(vm, runStrategy)}
    />
  ));
};

export const openMoveToFolderModal = (
  vm: V1VirtualMachine,
  createModal: (modal: ModalComponent) => void,
): void => {
  createModal((props) => (
    <MoveVMToFolderModal
      onSubmit={(folderName) => {
        const labels = vm?.metadata?.labels ?? {};
        labels[VM_FOLDER_LABEL] = folderName;
        return kubevirtK8sPatch({
          data: [{ op: 'replace', path: '/metadata/labels', value: labels }],
          model: VirtualMachineModel,
          resource: vm,
        });
      }}
      vm={vm}
      {...props}
    />
  ));
};
