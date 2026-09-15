import { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import type { StorageMigrationAPI } from '@kubevirt-utils/resources/migrations/constants';
import { Modal, ModalBody } from '@patternfly/react-core';

import VirtualMachineMigrateModalWizard from './VirtualMachineMigrateModalWizard';

import './virtual-machine-migration-modal.scss';

type VirtualMachineMigrateModalProps = {
  isOpen: boolean;
  onClose: () => Promise<void> | void;
  storageMigAPI: StorageMigrationAPI;
  vms: V1VirtualMachine[];
};

const VirtualMachineMigrateModal: FC<VirtualMachineMigrateModalProps> = ({
  isOpen,
  onClose,
  storageMigAPI,
  vms,
}) => (
  <Modal
    className="virtual-machine-migration-modal"
    id="virtual-machine-migration-modal"
    isOpen={isOpen}
    variant="large"
  >
    <ModalBody>
      <VirtualMachineMigrateModalWizard onClose={onClose} storageMigAPI={storageMigAPI} vms={vms} />
    </ModalBody>
  </Modal>
);

export default VirtualMachineMigrateModal;
