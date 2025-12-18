/* Copyright Contributors to the Open Cluster Management project */
import React, { FC, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { Modal, ModalBody } from '@patternfly/react-core';

import CrossClusterMigrationWizard from './CrossClusterMigrationWizard';

import './CrossClusterMigration.scss';

const CrossClusterMigration: FC<{
  close: () => void;
  isOpen?: boolean;
  resource?: V1VirtualMachine;
  resources?: V1VirtualMachine[];
}> = ({ close, isOpen = true, resource, resources }) => {
  const vms = useMemo(() => (resource ? [resource] : resources), [resource, resources]);
  return (
    <Modal
      className="virtual-machine-migration-modal"
      id="virtual-machine-migration-modal"
      isOpen={isOpen}
      variant="large"
    >
      <ModalBody>
        <CrossClusterMigrationWizard close={close} vms={vms} />
      </ModalBody>
    </Modal>
  );
};

export default CrossClusterMigration;
