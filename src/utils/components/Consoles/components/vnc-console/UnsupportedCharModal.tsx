import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Modal } from '@patternfly/react-core';

type UnsupportedCharModal = {
  isOpen: boolean;
  onClose: () => void;
  unsupportedChar: string;
};

const UnsupportedCharModal: FC<UnsupportedCharModal> = ({ isOpen, onClose, unsupportedChar }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Modal
      actions={[
        <Button key="cancel" onClick={onClose} variant="link">
          {t('Cancel')}
        </Button>,
      ]}
      className="confirm-multiple-vm-actions-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={t('Unsupported char {{char}}', unsupportedChar)}
      variant={'small'}
    >
      {t('The character is not supported by the keymap')}
    </Modal>
  );
};

export default UnsupportedCharModal;
