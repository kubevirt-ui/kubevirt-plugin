import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Checkbox,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  StackItem,
} from '@patternfly/react-core';

type ConfirmVMActionBaseModalProps = {
  action: () => Promise<string | void>;
  actionType: string;
  checkToConfirmMessage?: string;
  isOpen: boolean;
  onClose: () => void;
  severityVariant?: 'danger' | 'warning' | undefined;
  title: string;
};

const ConfirmVMActionBaseModal: FC<ConfirmVMActionBaseModalProps> = ({
  action,
  actionType,
  checkToConfirmMessage,
  children,
  isOpen,
  onClose,
  severityVariant,
  title,
}) => {
  const { t } = useKubevirtTranslation();
  const [isChecked, setIsChecked] = useState<boolean>(!checkToConfirmMessage);

  const submitHandler = () => {
    action();
    onClose();
  };

  return (
    <Modal
      className="confirm-multiple-vm-actions-modal"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={submitHandler}
      variant={'small'}
    >
      <ModalHeader title={title} titleIconVariant={severityVariant} />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>{children}</StackItem>
          <StackItem>
            {checkToConfirmMessage && (
              <Checkbox
                id={`check-to-confirm-action-${actionType}`}
                isChecked={isChecked}
                label={checkToConfirmMessage}
                onChange={(_, checked) => setIsChecked(checked)}
              />
            )}
          </StackItem>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          isDisabled={!isChecked}
          key="confirm"
          onClick={submitHandler}
          variant={severityVariant}
        >
          {t(actionType)}
        </Button>
        <Button key="cancel" onClick={onClose} variant={ButtonVariant.link}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmVMActionBaseModal;
