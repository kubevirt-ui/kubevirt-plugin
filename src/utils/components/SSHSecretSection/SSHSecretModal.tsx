import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import MutedTextSpan from '../MutedTextSpan/MutedTextSpan';
import TabModal from '../TabModal/TabModal';

import useSecretsData from './hooks/useSecretsData';
import { SecretSelectionOption, SSHSecretDetails } from './utils/types';
import { createSSHSecret } from './utils/utils';
import SSHSecretSection from './SSHSecretSection';

type SSHSecretModalProps = {
  initialSSHSecretDetails: SSHSecretDetails;
  isOpen: boolean;
  isTemplate?: boolean;
  isUserTab?: boolean;
  namespace: string;
  onClose: () => void;
  onSubmit: (sshDetails: SSHSecretDetails) => Promise<any | void>;
};

const SSHSecretModal: FC<SSHSecretModalProps> = ({
  initialSSHSecretDetails,
  isOpen,
  isTemplate = false,
  isUserTab = false,
  namespace,
  onClose,
  onSubmit,
}) => {
  const { t } = useKubevirtTranslation();

  const [sshDetails, setSSHDetails] = useState<SSHSecretDetails>(initialSSHSecretDetails);
  const [localNSProject, setLocalNSProject] = useState<string>(namespace);
  const { isDisabled, secretsData } = useSecretsData(sshDetails, localNSProject, namespace);

  return (
    <TabModal
      onSubmit={async () => {
        const { secretOption, sshPubKey, sshSecretName } = sshDetails;
        if (secretOption === SecretSelectionOption.addNew) {
          await createSSHSecret(sshPubKey, sshSecretName, namespace, true);
        }

        return onSubmit(sshDetails);
      }}
      headerText={t('Public SSH key')}
      isDisabled={isDisabled}
      isOpen={isOpen}
      onClose={onClose}
    >
      <MutedTextSpan text={t('SSH key is saved in the project as a secret')} />
      <SSHSecretSection
        isTemplate={isTemplate}
        isUserTab={isUserTab}
        localNSProject={localNSProject}
        namespace={namespace}
        secretsData={secretsData}
        setLocalNSProject={setLocalNSProject}
        setSSHDetails={setSSHDetails}
        sshDetails={sshDetails}
      />
    </TabModal>
  );
};

export default SSHSecretModal;
