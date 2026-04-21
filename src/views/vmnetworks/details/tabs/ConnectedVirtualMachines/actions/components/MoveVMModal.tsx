import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  Alert,
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';

import { VMNetworkWithProjects } from '../types';
import { moveVMsToNewNetwork } from '../utils';

import VMNetworkSelect from './VMNetworkSelect';

export type MoveVMModalProps = {
  closeModal?: () => void;
  currentNetwork: string;
  vms: V1VirtualMachine[];
};

const MoveVMModal: FC<MoveVMModalProps> = ({ closeModal, currentNetwork, vms }) => {
  const { t } = useKubevirtTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Error>();
  const [newNetwork, setNewNetwork] = useState<string>();
  const [newNetworkProjects, setNewNetworkProjects] = useState<string[]>([]);

  const vmsCount = vms.length;
  const isSingleVM = vmsCount === 1;

  const onSelect = ({ projectNames, vmNetworkName }: VMNetworkWithProjects) => {
    setNewNetwork(vmNetworkName);
    setNewNetworkProjects(projectNames);
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      await moveVMsToNewNetwork(vms, currentNetwork, newNetwork, newNetworkProjects);
      closeModal();
    } catch (error) {
      setSubmitError(error);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      id="move-vm-modal"
      isOpen
      onClose={closeModal}
      onEscapePress={closeModal}
      position="top"
      variant={ModalVariant.medium}
    >
      <ModalHeader
        title={
          isSingleVM
            ? t('Move virtual machine to another OVN localnet network?')
            : t('Move virtual machines to another OVN localnet network?')
        }
      />
      <ModalBody>
        <Form>
          <p>{t('Select the target network from the list of available networks')}</p>
          <FormGroup fieldId="vm-network" isRequired label={t('Virtual machine network')}>
            <VMNetworkSelect
              currentNetwork={currentNetwork}
              onSelect={onSelect}
              selectedNetwork={newNetwork}
              vms={vms}
            />
          </FormGroup>
          {newNetwork && (
            <Alert
              title={
                isSingleVM
                  ? t(
                      'This action will disconnect the {{vmName}} virtual machine from {{currentNetwork}} and reconnect it to {{newNetwork}}.',
                      {
                        currentNetwork,
                        newNetwork,
                        vmName: getName(vms[0]),
                      },
                    )
                  : t(
                      'This action will disconnect the {{vmsCount}} virtual machines from {{currentNetwork}} and reconnect them to {{newNetwork}}.',
                      {
                        currentNetwork,
                        newNetwork,
                        vmsCount,
                      },
                    )
              }
              isInline
              isPlain
              variant="warning"
            />
          )}
          <ErrorAlert error={submitError} />
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button isDisabled={!newNetwork} isLoading={isSubmitting} onClick={onSubmit}>
          {t('Move virtual machine', { count: vmsCount })}
        </Button>
        <Button onClick={closeModal} variant={ButtonVariant.link}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default MoveVMModal;
