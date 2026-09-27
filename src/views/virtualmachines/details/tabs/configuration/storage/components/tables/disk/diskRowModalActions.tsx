import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
  type V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { type ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { type DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';

import CreateBootableVolumeModal from '../../modal/CreateBootableVolumeModal';
import EjectCDROMModal from '../../modal/EjectCDROMModal';
import MakePersistentModal from '../../modal/MakePersistentModal';
import MountCDROMModal from '../../modal/MountCDROMModal';
import DiskRowDeleteModal from './DiskRowDeleteModal';
import { isPVCSource } from './utils/helpers';

type CreateModal = (modal: ModalComponent) => void;

export const openEditDiskModal = (
  createModal: CreateModal,
  obj: DiskRowDataLayout,
  diskName: string,
  onDiskSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>,
  vm: V1VirtualMachine,
  isWizardCustomizationStep?: boolean,
): void => {
  createModal(({ isOpen, onClose }) => (
    <DiskModal
      createdPVCName={isPVCSource(obj) ? obj?.source : null}
      editDiskName={diskName}
      isOpen={isOpen}
      isWizardCustomizationStep={isWizardCustomizationStep}
      onClose={onClose}
      onSubmit={onDiskSubmit}
      vm={vm}
    />
  ));
};

export const openDeleteDiskModal = (
  createModal: CreateModal,
  params: {
    diskName: string;
    isCDROM: boolean;
    isHotplug: boolean;
    isWizardCustomizationStep: boolean;
    onCustomizeDeleteDisk: () => Promise<V1VirtualMachine>;
    vm: V1VirtualMachine;
    volume: undefined | V1Volume;
  },
): void => {
  createModal(({ isOpen, onClose }) => (
    <DiskRowDeleteModal
      diskName={params.diskName}
      isCDROM={params.isCDROM}
      isHotplug={params.isHotplug}
      isOpen={isOpen}
      isWizardCustomizationStep={params.isWizardCustomizationStep}
      onClose={onClose}
      onCustomizeDeleteDisk={params.onCustomizeDeleteDisk}
      vm={params.vm}
      volume={params.volume}
    />
  ));
};

export const openBootableVolumeModal = (
  createModal: CreateModal,
  obj: DiskRowDataLayout,
  vm: V1VirtualMachine,
): void => {
  createModal(({ isOpen, onClose }) => (
    <CreateBootableVolumeModal diskObj={obj} isOpen={isOpen} onClose={onClose} vm={vm} />
  ));
};

export const openMakePersistentModal = (
  createModal: CreateModal,
  vm: V1VirtualMachine,
  vmi: undefined | V1VirtualMachineInstance,
  volume: undefined | V1Volume,
): void => {
  createModal(({ isOpen, onClose }) => (
    <MakePersistentModal isOpen={isOpen} onClose={onClose} vm={vm} vmi={vmi} volume={volume} />
  ));
};

export const openCDROMModal = (
  createModal: CreateModal,
  params: {
    diskName: string;
    diskSource: string | undefined;
    isCDROMMountedState: boolean;
    isWizardCustomizationStep?: boolean;
    onDiskSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
    vm: V1VirtualMachine;
  },
): void => {
  const isCDROMMountedState = params.isCDROMMountedState;
  const Component = isCDROMMountedState ? EjectCDROMModal : MountCDROMModal;
  createModal(({ isOpen, onClose }) => (
    <Component
      cdromName={params.diskName}
      isOpen={isOpen}
      isWizardCustomizationStep={isCDROMMountedState ? undefined : params.isWizardCustomizationStep}
      onClose={onClose}
      onSubmit={params.onDiskSubmit}
      source={isCDROMMountedState ? params.diskSource : undefined}
      vm={params.vm}
    />
  ));
};
