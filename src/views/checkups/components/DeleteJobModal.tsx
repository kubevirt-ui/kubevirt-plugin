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

type DeleteJobModalProps = {
  isOpen: boolean;
  jobName: string;
  namespace: string;
  onClose: () => void;
  onDelete: () => void;
};

const DeleteJobModal: FC<DeleteJobModalProps> = ({
  isOpen,
  jobName,
  namespace,
  onClose,
  onDelete,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} variant={ModalVariant.medium}>
      <ModalHeader title={t('Delete job')} titleIconVariant="warning" />
      <ModalBody>
        <ConfirmActionMessage obj={{ metadata: { name: jobName, namespace } }} />
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

export default DeleteJobModal;
