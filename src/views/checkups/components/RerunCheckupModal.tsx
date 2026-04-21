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

type RerunCheckupModalPropsBase = {
  isOpen: boolean;
  message: ReactNode | string;
  onClose: () => void;
};

type RerunCheckupModalProps =
  | (RerunCheckupModalPropsBase & { onConfirm: () => Promise<void> | void; variant: 'warning' })
  | (RerunCheckupModalPropsBase & { onConfirm?: never; variant: 'error' });

const RerunCheckupModal: FC<RerunCheckupModalProps> = ({
  isOpen,
  message,
  onClose,
  onConfirm,
  variant,
}) => {
  const { t } = useKubevirtTranslation();

  const isWarning = variant === 'warning';
  const title = isWarning ? t('Rerun checkup') : t('Failed to rerun checkup');

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant={ModalVariant.medium}>
      <ModalHeader title={title} titleIconVariant={isWarning ? 'warning' : 'danger'} />
      <ModalBody>{message}</ModalBody>
      <ModalFooter>
        {isWarning ? (
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
