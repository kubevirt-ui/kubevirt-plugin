import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import MutedTextSpan from '../MutedTextSpan/MutedTextSpan';
import TabModal from '../TabModal/TabModal';

import { SSHSecretDetails } from './utils/types';
import SSHSecretSection from './SSHSecretSection';

type SSHSecretModalProps = {
  initialSSHSecretDetails: SSHSecretDetails;
  isOpen: boolean;
  namespace: string;
  onClose: () => void;
  onSubmit: (sshDetails: SSHSecretDetails) => Promise<any | void>;
};

const SSHSecretModal: FC<SSHSecretModalProps> = ({
  initialSSHSecretDetails,
  isOpen,
  namespace,
  onClose,
  onSubmit,
}) => {
  const { t } = useKubevirtTranslation();

  const [sshDetails, setSSHDetails] = useState<SSHSecretDetails>(initialSSHSecretDetails);

  return (
    <TabModal
      headerText={t('Authorized SSH key')}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => onSubmit(sshDetails)}
    >
      <MutedTextSpan text={t('SSH key is saved in the project as a secret')} />
      <SSHSecretSection
        namespace={namespace}
        setSSHDetails={setSSHDetails}
        sshDetails={sshDetails}
      />
    </TabModal>
  );
};

export default SSHSecretModal;
