import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, VirtualMachineModel } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Popover,
  Stack,
} from '@patternfly/react-core';

import { disconnectVMsFromNetwork } from '../utils';

export type DisconnectVMModalProps = {
  closeModal?: () => void;
  currentNetwork: string;
  vms: V1VirtualMachine[];
};

const DisconnectVMModal: FC<DisconnectVMModalProps> = ({ closeModal, currentNetwork, vms }) => {
  const { t } = useKubevirtTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vmsCount = vms.length;

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      disconnectVMsFromNetwork(vms, currentNetwork);
      closeModal();
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      id="disconnect-vm-modal"
      isOpen
      onClose={closeModal}
      onEscapePress={closeModal}
      position="top"
      variant={ModalVariant.small}
    >
      <ModalHeader
        title={t('Disconnect virtual machine from this network?', { count: vmsCount })}
        titleIconVariant={'warning'}
      />
      <ModalBody>
        {vmsCount === 1 ? (
          <Trans t={t}>
            Are you sure you want to disconnect <strong>{getName(vms[0])}</strong> virtual machine
            from <strong>{currentNetwork}</strong> network?
          </Trans>
        ) : (
          <>
            {t('Are you sure you want to disconnect ')}
            <Popover
              bodyContent={
                <Stack hasGutter>
                  {vms.map((vm) => (
                    <ResourceLink
                      groupVersionKind={modelToGroupVersionKind(VirtualMachineModel)}
                      key={getName(vm)}
                      name={getName(vm)}
                      namespace={getNamespace(vm)}
                    />
                  ))}
                </Stack>
              }
            >
              <Button isInline variant="link">
                {vmsCount} {t('selected virtual machines')}
              </Button>
            </Popover>
            <Trans t={t}>
              {' '}
              from <strong>{currentNetwork}</strong> network?
            </Trans>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button isLoading={isSubmitting} onClick={onSubmit} variant={ButtonVariant.danger}>
          {t('Disconnect')}
        </Button>
        <Button onClick={closeModal} variant={ButtonVariant.link}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DisconnectVMModal;
