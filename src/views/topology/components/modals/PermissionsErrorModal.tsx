import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';

type PermissionsErrorModalProps = {
  errorMsg: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

const PermissionsErrorModal: FC<PermissionsErrorModalProps> = ({
  errorMsg,
  isOpen,
  onClose,
  title,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} position="top" variant={ModalVariant.medium}>
      <ModalHeader title={title} />
      <ModalBody>
        <Alert isInline title={t('Permissions required')} variant="danger">
          {errorMsg}
        </Alert>
      </ModalBody>
      <ModalFooter>
        <Button data-test-id="modal-close-action" onClick={onClose} type="button">
          {t('Close')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default PermissionsErrorModal;
