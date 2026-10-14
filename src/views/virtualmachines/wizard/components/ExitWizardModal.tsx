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
  isOpen: boolean;
  onClose: () => void;
  onExit: () => void;
};

const ExitWizardModal: FC<ExitWizardModalProps> = ({ isOpen, onClose, onExit }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant={ModalVariant.small}>
      <ModalHeader title={t('Exit VirtualMachine creation?')} titleIconVariant="warning" />
      <ModalBody>{t("If you leave now, any information you've entered won't be saved.")}</ModalBody>
      <ModalFooter>
        <Button onClick={onExit} variant="primary">
          {t('Exit without saving')}
        </Button>
        <Button onClick={onClose} variant="link">
          {t('Continue creating')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ExitWizardModal;
