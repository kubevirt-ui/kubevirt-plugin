import React, { FC } from 'react';

import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ActionGroup, Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';

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
    <Modal
      footer={
        <ActionGroup>
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
        </ActionGroup>
      }
      isOpen={isOpen}
      onClose={onClose}
      title={t('Delete checkup')}
      variant={ModalVariant.medium}
    >
      <ConfirmActionMessage obj={{ metadata: { name, namespace } }} />
    </Modal>
  );
};

export default DeleteCheckupModal;
