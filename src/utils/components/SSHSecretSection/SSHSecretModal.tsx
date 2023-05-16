import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import MutedTextSpan from '../MutedTextSpan/MutedTextSpan';
import TabModal from '../TabModal/TabModal';

import { SSHSecretDetails } from './utils/types';
import SSHSecretSection from './SSHSecretSection';

type SSHSecretModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialSSHSecretDetails: SSHSecretDetails;
  onSubmit: (sshDetails: SSHSecretDetails) => Promise<void | any>;
  namespace: string;
};

const SSHSecretModal: FC<SSHSecretModalProps> = ({
  onSubmit,
  onClose,
  isOpen,
  initialSSHSecretDetails,
  namespace,
}) => {
  const { t } = useKubevirtTranslation();

  const [sshDetails, setSSHDetails] = useState<SSHSecretDetails>(initialSSHSecretDetails);

  return (
    <TabModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => onSubmit(sshDetails)}
      headerText={t('Authorized SSH key')}
    >
      <MutedTextSpan text={t('SSH key is saved in the project as a secret')} />
      <SSHSecretSection
        namespace={namespace}
        sshDetails={sshDetails}
        setSSHDetails={setSSHDetails}
      />
    </TabModal>
  );
};

export default SSHSecretModal;
