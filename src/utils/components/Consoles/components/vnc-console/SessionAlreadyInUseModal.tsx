import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';

import { ConsoleState } from '../utils/ConsoleConsts';

export type SessionAlreadyInUseModalProps = {
  connect?: (preserveSession: boolean) => void;
  isOpen: boolean;
  setConsoleState: Dispatch<SetStateAction<ConsoleState>>;
};

const SessionAlreadyInUseModal: FC<SessionAlreadyInUseModalProps> = ({
  connect,
  isOpen,
  setConsoleState,
}) => {
  const { t } = useKubevirtTranslation();
  const onClose = () => setConsoleState(ConsoleState.disconnected);
  return (
    <Modal isOpen={isOpen} onClose={onClose} position="top" variant={'small'}>
      <ModalHeader title={t('VNC session already in use')} titleIconVariant={'warning'} />
      <ModalBody>
        <p>{t("Another user is currently connected to this Virtual Machine's console.")}</p>
        <p>{t('Connecting now will disconnect their session and give you control.')}</p>
      </ModalBody>
      <ModalFooter>
        <Button key="cancel" onClick={onClose} variant="primary">
          {t('Try later')}
        </Button>
        <Button key="forceConnect" onClick={() => connect?.(false)} variant="secondary">
          {t('Disconnect user and connect')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default SessionAlreadyInUseModal;
