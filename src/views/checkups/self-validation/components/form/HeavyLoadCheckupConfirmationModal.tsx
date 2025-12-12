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

type HeavyLoadCheckupConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const HeavyLoadCheckupConfirmationModal: FC<HeavyLoadCheckupConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t } = useKubevirtTranslation();
  const [isConfirmationChecked, setIsConfirmationChecked] = useState(false);

  const handleConfirm = () => {
    setIsConfirmationChecked(false);
    onConfirm();
  };

  const handleClose = () => {
    setIsConfirmationChecked(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} variant="small">
      <ModalHeader title="Heavy load checkups" titleIconVariant="warning" />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            {t(
              'You are about to run heavy self validation checkups which generate significant load and may destabilize your cluster.',
            )}
          </StackItem>
          <StackItem>
            <Checkbox
              label={t(
                'I confirm this is a non-production environment safe for heavy load testing.',
              )}
              id="confirm-non-production-checkbox"
              isChecked={isConfirmationChecked}
              onChange={(_, checked: boolean) => setIsConfirmationChecked(checked)}
            />
          </StackItem>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          isDisabled={!isConfirmationChecked}
          onClick={handleConfirm}
          variant={ButtonVariant.primary}
        >
          {t('Run checkup')}
        </Button>
        <Button onClick={handleClose} variant={ButtonVariant.link}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default HeavyLoadCheckupConfirmationModal;
