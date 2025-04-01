import React from 'react';
import { useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { unpauseVM } from '@virtualmachines/actions/actions';

export type VMStatusModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  vm: V1VirtualMachine;
};

const VMStatusModal = ({ isOpen, onClose, title = null, vm }: VMStatusModalProps) => {
  const { t } = useKubevirtTranslation();
  const [error, setError] = useState(undefined);

  const modalTitle = title || t('Edit pause state');

  const onSubmit = async (event) => {
    event.preventDefault();

    unpauseVM(vm).catch((err) => setError(err));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} position="top" variant={ModalVariant.medium}>
      <ModalHeader title={modalTitle} />
      <ModalBody>
        <Stack hasGutter>
          {error && (
            <StackItem>
              <Alert isInline title={t('An error occurred')} variant={AlertVariant.danger}>
                <Stack hasGutter>
                  <StackItem>{error.message}</StackItem>
                  {error?.href && (
                    <StackItem>
                      <a href={error.href} rel="noreferrer" target="_blank">
                        {error.href}
                      </a>
                    </StackItem>
                  )}
                </Stack>
              </Alert>
            </StackItem>
          )}
          <StackItem>
            {t(
              'This VM is paused. To unpause it, click the Unpause button below. For further details, check with your system administrator.',
            )}
          </StackItem>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button onClick={(event) => onSubmit(event)}>{t('Unpause')}</Button>
        <Button onClick={onClose} size="sm" variant={ButtonVariant.link}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default VMStatusModal;
