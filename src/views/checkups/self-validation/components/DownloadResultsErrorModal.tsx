import React, { FC } from 'react';

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
import { DownloadIcon } from '@patternfly/react-icons';

type DownloadResultsErrorModalProps = {
  errorMessage: string;
  isOpen: boolean;
  onClose: () => void;
  url?: string;
};

const DownloadResultsErrorModal: FC<DownloadResultsErrorModalProps> = ({
  errorMessage,
  isOpen,
  onClose,
  url,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant={ModalVariant.medium}>
      <ModalHeader title={t('Could not download results file')} />
      <ModalBody>{errorMessage}</ModalBody>
      <ModalFooter>
        {url && (
          <Button
            onClick={() => {
              window.open(url, '_blank', 'noopener,noreferrer');
              onClose();
            }}
            icon={<DownloadIcon />}
            variant={ButtonVariant.control}
          >
            {t('Try opening the URL directly')}
          </Button>
        )}
        <Button onClick={onClose} variant={url ? ButtonVariant.link : ButtonVariant.primary}>
          {url ? t('Cancel') : t('Close')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DownloadResultsErrorModal;
