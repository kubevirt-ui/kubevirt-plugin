import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';

type UnsupportedCharModal = {
  isOpen: boolean;
  onClose: () => void;
  unsupportedChars: string[];
};

const UnsupportedCharModal: FC<UnsupportedCharModal> = ({ isOpen, onClose, unsupportedChars }) => {
  const { t } = useKubevirtTranslation();
  const maxChars = 10;
  const unsupportedCharCount = unsupportedChars.length;
  return (
    <Modal isOpen={isOpen} onClose={onClose} position="top" variant={'small'}>
      <ModalHeader title={t('Unsupported content in the clipboard')} />
      <ModalBody>
        {t(
          '{{unsupportedCharCount}} characters are not supported by the keyboard layout mapping:',
          {
            unsupportedCharCount,
          },
        )}
        <List>
          {unsupportedChars.splice(0, maxChars).map((char) => (
            <ListItem key={char}>{`'${char}' (0x${char.codePointAt(0).toString(16)})`}</ListItem>
          ))}
          {unsupportedCharCount > maxChars && <ListItem>...</ListItem>}
        </List>
      </ModalBody>
      <ModalFooter>
        <Button key="cancel" onClick={onClose} variant="link">
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UnsupportedCharModal;
