import { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';

type ExitWizardModalProps = {
  continueButtonText?: string;
  isOpen: boolean;
  onClose: () => void;
  onExit: () => void;
  title?: string;
};

const ExitWizardModal: FC<ExitWizardModalProps> = ({
  continueButtonText,
  isOpen,
  onClose,
  onExit,
  title,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant={ModalVariant.small}>
      <ModalHeader title={title ?? t('Exit VirtualMachine creation?')} titleIconVariant="warning" />
      <ModalBody>{t("If you leave now, any information you've entered won't be saved.")}</ModalBody>
      <ModalFooter>
        <Button onClick={onExit} variant="primary">
          {t('Exit without saving')}
        </Button>
        <Button onClick={onClose} variant="link">
          {continueButtonText ?? t('Continue creating')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ExitWizardModal;
