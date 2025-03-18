import React, { FC } from 'react';

import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
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

type DeleteCheckupModalProps = {
  isOpen: boolean;
  name: string;
  namespace: string;
  onClose: () => void;
  onDelete: () => void;
};

const DeleteCheckupModal: FC<DeleteCheckupModalProps> = ({
  isOpen,
  name,
  namespace,
  onClose,
  onDelete,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} variant={ModalVariant.medium}>
      <ModalHeader title={t('Delete checkup')} />
      <ModalBody>
        <ConfirmActionMessage obj={{ metadata: { name, namespace } }} />
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={() => {
            onDelete();
            onClose();
          }}
          variant={ButtonVariant.danger}
        >
          {t('Delete')}
        </Button>
        <Button onClick={onClose} variant={ButtonVariant.link}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteCheckupModal;
