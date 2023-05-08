import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import MutedTextSpan from '../MutedTextSpan/MutedTextSpan';
import TabModal from '../TabModal/TabModal';

import { initialSSHCredentials } from './utils/constants';
import { SSHSecretDetails } from './utils/types';
import SSHSecretSection from './SSHSecretSection';

type SSHSecretModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (credentials: SSHSecretDetails) => Promise<void | any>;
  namespace: string;
};

const SSHSecretModal: FC<SSHSecretModalProps> = ({ onSubmit, onClose, isOpen, ...restProps }) => {
  const { t } = useKubevirtTranslation();

  const [sshSecretCredentials, setSSHSecretCredentials] =
    useState<SSHSecretDetails>(initialSSHCredentials);

  return (
    <TabModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => onSubmit(sshSecretCredentials)}
      headerText={t('Authorized SSH key')}
    >
      <MutedTextSpan text={t('SSH key is saved in the project as a secret')} />
      <SSHSecretSection
        {...restProps}
        sshSecretCredentials={sshSecretCredentials}
        setSSHSecretCredentials={setSSHSecretCredentials}
      />
    </TabModal>
  );
};

export default SSHSecretModal;
