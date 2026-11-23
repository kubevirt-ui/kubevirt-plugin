import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { TELEMETRY_VM_ACTION } from '@kubevirt-utils/extensions/telemetry';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { Modal, ModalBody, ModalHeader, Stack, StackItem } from '@patternfly/react-core';
import { deleteVM } from '@virtualmachines/actions/actions';
import {
  getNamespaces,
  runActionOnVMs,
} from '@virtualmachines/actions/components/ConfirmMultipleVMActionsModal/utils/utils';

import DeleteAllVMsConfirmation from './components/DeleteAllConfirmation';
import DeleteAllVMsFooter from './components/DeleteAllVMsFooter';
import DeleteAllVMsList from './components/DeleteAllVmsList';
import DeleteModalMultipleProjectNames from './components/VMsNamespaceDeleteModal';
import { DEFAULT_VM_COUNT } from './constants';

import './delete-all-vms.scss';

export type DeleteAllVMsConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vms: V1VirtualMachine[];
};

const DeleteAllVMsConfirmationModal: FC<DeleteAllVMsConfirmationModalProps> = ({
  isOpen,
  onClose,
  vms,
}) => {
  const { t } = useKubevirtTranslation();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAll, setShowAll] = useState(false);
  const [confirmationValue, setConfirmationValue] = useState<string>('');
  const [searchVirtualMachines, setSearchVirtualMachines] = useState<string>('');
  const [error, setError] = useState<Error | undefined>();

  const namespaces = getNamespaces(vms);
  const firstProjectName = namespaces[0];
  const extraNamespaces = namespaces.slice(1);
  const hasMultipleNamespaces = namespaces.length > 1;

  const filteredVMs = searchVirtualMachines
    ? vms.filter((vm) => getName(vm)?.includes(searchVirtualMachines))
    : vms;
  const visibleVMs = showAll ? filteredVMs : filteredVMs.slice(0, DEFAULT_VM_COUNT);
  const numVMs = vms.length;
  const isConfirmed = confirmationValue === numVMs.toString();

  const actionOnVms = () => runActionOnVMs(vms, deleteVM, TELEMETRY_VM_ACTION.DELETE);

  const handleSearchVirtualMachines = (value: string) => {
    setSearchVirtualMachines(value);
    setShowAll(false);
  };

  const handleClose = () => {
    setShowAll(false);
    setConfirmationValue('');
    setSearchVirtualMachines('');
    setError(undefined);
    onClose();
  };

  const submitHandler = async () => {
    if (isSubmitting || !isConfirmed) return;
    setIsSubmitting(true);
    setError(undefined);
    try {
      await actionOnVms();
      handleClose();
    } catch (submitError) {
      setError(submitError as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const projectDisplay = (
    <DeleteModalMultipleProjectNames
      extraNamespaces={extraNamespaces}
      firstProjectName={firstProjectName}
      hasMultipleNamespaces={hasMultipleNamespaces}
    />
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={submitHandler}
      position="top"
      variant="small"
    >
      <ModalHeader title={t('Delete multiple VirtualMachines?')} titleIconVariant={'warning'} />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <Trans ns="plugin__kubevirt-plugin" t={t}>
              Are you sure you want to delete <strong>{{ numVMs }} VirtualMachines</strong> <br />{' '}
              in project {projectDisplay}. All the selected VMs and their associated data will be
              lost.
            </Trans>
          </StackItem>
          <DeleteAllVMsList
            filteredVMs={filteredVMs}
            handleSearchVirtualMachines={handleSearchVirtualMachines}
            hasMultipleNamespaces={hasMultipleNamespaces}
            searchVirtualMachines={searchVirtualMachines}
            setShowAll={setShowAll}
            showAll={showAll}
            visibleVMs={visibleVMs}
            vms={vms}
          />
          <StackItem>
            <DeleteAllVMsConfirmation
              confirmationValue={confirmationValue}
              numVMs={numVMs}
              setConfirmationValue={setConfirmationValue}
            />
          </StackItem>
        </Stack>
      </ModalBody>
      <DeleteAllVMsFooter
        error={error}
        handleClose={handleClose}
        isConfirmed={isConfirmed}
        isSubmitting={isSubmitting}
        numVMs={numVMs}
        submitHandler={submitHandler}
      />
    </Modal>
  );
};

export default DeleteAllVMsConfirmationModal;
