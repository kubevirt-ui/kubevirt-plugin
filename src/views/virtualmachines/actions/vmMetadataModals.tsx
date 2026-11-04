import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { type ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import RunStrategyModal from '@kubevirt-utils/components/RunStrategyModal/RunStrategyModal';
import { updateRunStrategy } from '@kubevirt-utils/components/RunStrategyModal/utils';
import { patchVM } from '@kubevirt-utils/resources/vm/utils/patch';
import {
  getEffectiveRunStrategy,
  isVMNotStopped,
} from '@kubevirt-utils/resources/vm/utils/selectors';
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
        patchVM(vm, [{ op: 'replace', path: '/metadata/labels', value: labels }])
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
        return patchVM(vm, [{ op: 'replace', path: '/metadata/labels', value: labels }]);
      }}
      vm={vm}
      {...props}
    />
  ));
};
