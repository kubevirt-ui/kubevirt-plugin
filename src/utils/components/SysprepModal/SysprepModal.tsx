import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ModalVariant } from '@patternfly/react-core';

import TabModal from '../TabModal/TabModal';

import Sysprep from './Sysprep';

export const SysprepModal: React.FC<{
  isOpen: boolean;
  autoUnattend: string;
  unattend: string;
  onAutoUnattendChange: (value: string) => void | Promise<void>;
  onUnattendChange: (value: string) => void | Promise<void>;
  onClose: () => void;
}> = ({
  isOpen,
  onClose,
  autoUnattend: initialAutoUnattend,
  unattend: initialUnattend,
  onAutoUnattendChange,
  onUnattendChange,
}) => {
  const { t } = useKubevirtTranslation();
  const [autoUnattend, setAutoUnattend] = React.useState(initialAutoUnattend);
  const [unattend, setUnattend] = React.useState(initialUnattend);

  const submitHandler = React.useCallback(async () => {
    onAutoUnattendChange(autoUnattend);
    onUnattendChange(unattend);
  }, [onAutoUnattendChange, autoUnattend, onUnattendChange, unattend]);

  return (
    <TabModal
      onSubmit={() => submitHandler()}
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('Sysprep')}
      modalVariant={ModalVariant.medium}
      submitBtnText={t('Save')}
    >
      <Sysprep
        autoUnattend={autoUnattend}
        onAutoUnattendChange={setAutoUnattend}
        unattend={unattend}
        onUnattendChange={setUnattend}
      />
    </TabModal>
  );
};
