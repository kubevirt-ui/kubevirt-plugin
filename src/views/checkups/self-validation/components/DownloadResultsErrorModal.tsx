import React, { FC } from 'react';
import { Trans } from 'react-i18next';

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
      <ModalBody>
        {errorMessage}
        {url && (
          <Trans ns="plugin__kubevirt-plugin" t={t}>
            {' '}
            Please{' '}
            <a href={url} onClick={onClose} rel="noopener noreferrer" target="_blank">
              approve this certificate
            </a>{' '}
            and try again.
          </Trans>
        )}
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose} variant={ButtonVariant.primary}>
          {t('Close')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DownloadResultsErrorModal;
