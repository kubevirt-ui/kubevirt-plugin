import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  Label,
  LabelGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';

import { toUnicodeFormat } from './utils/util';

export type UnsupportedCharModalProps = {
  isOpen: boolean;
  onClose: () => void;
  unsupportedChars: string[];
};

const MAX_VISIBLE_UNSUPPORTED_CHARS = 10;

const UnsupportedCharModal: FC<UnsupportedCharModalProps> = ({
  isOpen,
  onClose,
  unsupportedChars,
}) => {
  const { t } = useKubevirtTranslation();
  const unsupportedCharCount = unsupportedChars.length;
  return (
    <Modal isOpen={isOpen} onClose={onClose} position="top" variant={'small'}>
      <ModalHeader title={t('Unsupported characters in the clipboard')} />
      <ModalBody>
        {t('Found {{count}} characters not supported by the selected keyboard layout:', {
          count: unsupportedCharCount,
        })}
        <LabelGroup numLabels={MAX_VISIBLE_UNSUPPORTED_CHARS}>
          {unsupportedChars.map((char) => (
            <Label key={char} variant="outline">{`${char} (${toUnicodeFormat(
              char.codePointAt(0),
            )})`}</Label>
          ))}
        </LabelGroup>
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
