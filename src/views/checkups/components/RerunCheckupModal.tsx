import React, { FC, ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';

type RerunCheckupModalProps = {
  isOpen: boolean;
  message: ReactNode | string;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
  variant: 'confirmation' | 'error' | 'warning';
};

const RerunCheckupModal: FC<RerunCheckupModalProps> = ({
  isOpen,
  message,
  onClose,
  onConfirm,
  variant,
}) => {
  const { t } = useKubevirtTranslation();

  const isConfirmation = variant === 'warning' || variant === 'confirmation';
  const title = isConfirmation ? t('Rerun checkup') : t('Failed to rerun checkup');

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant={ModalVariant.medium}>
      <ModalHeader
        title={title}
        {...(variant !== 'confirmation' && {
          titleIconVariant: variant === 'warning' ? 'warning' : 'danger',
        })}
      />
      <ModalBody>{message}</ModalBody>
      <ModalFooter>
        {isConfirmation ? (
          <>
            <Button onClick={onConfirm} variant={ButtonVariant.primary}>
              {t('Rerun')}
            </Button>
            <Button onClick={onClose} variant={ButtonVariant.link}>
              {t('Cancel')}
            </Button>
          </>
        ) : (
          <Button onClick={onClose} variant={ButtonVariant.primary}>
            {t('Close')}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default RerunCheckupModal;
