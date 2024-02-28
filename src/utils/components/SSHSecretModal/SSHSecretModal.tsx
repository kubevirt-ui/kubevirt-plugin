import React, { FC, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty, validateSSHPublicKey } from '@kubevirt-utils/utils/utils';

import MutedTextSpan from '../MutedTextSpan/MutedTextSpan';
import TabModal from '../TabModal/TabModal';

import SSHSecretModalBody from './components/SSHSecretModalBody/SSHSecretModalBody';
import useSecretsData from './hooks/useSecretsData';
import { SecretSelectionOption, SSHSecretDetails } from './utils/types';
import { createSSHSecret, validateSecretNameLength, validateSecretNameUnique } from './utils/utils';

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
  const secretsData = useSecretsData(localNSProject, namespace);

  const isDisabled = useMemo(() => {
    const { allSecrets, secretsLoaded } = secretsData;
    const { secretOption, sshPubKey, sshSecretName } = sshDetails;

    return (
      !secretsLoaded ||
      (secretOption === SecretSelectionOption.useExisting && isEmpty(sshSecretName)) ||
      (secretOption === SecretSelectionOption.addNew &&
        (isEmpty(sshPubKey) ||
          isEmpty(sshSecretName) ||
          !validateSSHPublicKey(sshPubKey) ||
          !validateSecretNameUnique(sshSecretName, localNSProject, allSecrets) ||
          !validateSecretNameLength(sshSecretName)))
    );
  }, [localNSProject, secretsData, sshDetails]);

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
      <SSHSecretModalBody
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
