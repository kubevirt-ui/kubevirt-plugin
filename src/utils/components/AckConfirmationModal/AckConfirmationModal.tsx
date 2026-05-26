import React, { FC, ReactNode, useEffect, useState } from 'react';

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

export type AckConfirmationModalProps = {
  action: () => Promise<string | void> | void;
  actionLabel: string;
  actionType?: string;
  checkToConfirmMessage?: string;
  children?: ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  severityVariant?: 'danger' | 'warning' | undefined;
  title: string;
};

const AckConfirmationModal: FC<AckConfirmationModalProps> = ({
  action,
  actionLabel,
  actionType,
  checkToConfirmMessage,
  children,
  className,
  isOpen,
  onClose,
  severityVariant,
  title,
}) => {
  const { t } = useKubevirtTranslation();
  const [isChecked, setIsChecked] = useState<boolean>(!checkToConfirmMessage);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setIsChecked(!checkToConfirmMessage);
    }
  }, [checkToConfirmMessage, isOpen]);

  const submitHandler = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await action();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      className={className}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={submitHandler}
      variant="small"
    >
      <ModalHeader title={title} titleIconVariant={severityVariant ? 'warning' : undefined} />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>{children}</StackItem>
          {checkToConfirmMessage && (
            <StackItem>
              <Checkbox
                id={`ack-confirm-${actionType ?? 'action'}`}
                isChecked={isChecked}
                label={checkToConfirmMessage}
                onChange={(_, checked) => setIsChecked(checked)}
              />
            </StackItem>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          isDisabled={!isChecked || isSubmitting}
          isLoading={isSubmitting}
          key="confirm"
          onClick={submitHandler}
          variant={severityVariant === 'danger' ? ButtonVariant.danger : ButtonVariant.primary}
        >
          {actionLabel}
        </Button>
        <Button key="cancel" onClick={onClose} variant={ButtonVariant.link}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AckConfirmationModal;
