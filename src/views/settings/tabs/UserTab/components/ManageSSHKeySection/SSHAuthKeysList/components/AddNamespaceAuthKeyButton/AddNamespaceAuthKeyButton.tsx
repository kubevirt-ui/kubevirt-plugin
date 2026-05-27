import React, { FC } from 'react';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SSHSecretModal from '@kubevirt-utils/components/SSHSecretModal/SSHSecretModal';
import { initialSSHCredentials } from '@kubevirt-utils/components/SSHSecretModal/utils/constants';
import {
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

type AddNamespaceAuthKeyButtonProps = {
  cluster?: string;
  onSubmit: (sshDetails: SSHSecretDetails) => Promise<any>;
  secretName: string;
  selectedNamespace: string;
};

const AddNamespaceAuthKeyButton: FC<AddNamespaceAuthKeyButtonProps> = ({
  cluster,
  onSubmit,
  secretName,
  selectedNamespace,
}) => {
  const { t } = useKubevirtTranslation();

  const { createModal } = useModal();
  return (
    <Button
      onClick={() =>
        createModal((modalProps) => (
          <SSHSecretModal
            initialSSHSecretDetails={
              isEmpty(secretName)
                ? initialSSHCredentials
                : {
                    applyKeyToNamespace: true,
                    secretOption: SecretSelectionOption.useExisting,
                    sshPubKey: '',
                    sshSecretName: secretName,
                    sshSecretNamespace: selectedNamespace,
                  }
            }
            cluster={cluster}
            namespace={selectedNamespace}
            onSubmit={onSubmit}
            {...modalProps}
            isUserTab
          />
        ))
      }
      className="namespace-ssh-row__secret-name"
      icon={<PencilAltIcon />}
      iconPosition="end"
      isDisabled={isEmpty(selectedNamespace)}
      isInline
      variant={ButtonVariant.link}
    >
      {isEmpty(secretName) ? t('Not configured') : secretName}
    </Button>
  );
};

export default AddNamespaceAuthKeyButton;
