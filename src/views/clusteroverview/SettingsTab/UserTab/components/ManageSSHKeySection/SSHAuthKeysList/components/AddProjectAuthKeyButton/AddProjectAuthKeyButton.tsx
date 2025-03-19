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

type AddProjectAuthKeyButtonProps = {
  onSubmit: (sshDetails: SSHSecretDetails) => Promise<any>;
  secretName: string;
  selectedProject: string;
};

const AddProjectAuthKeyButton: FC<AddProjectAuthKeyButtonProps> = ({
  onSubmit,
  secretName,
  selectedProject,
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
                    applyKeyToProject: true,
                    secretOption: SecretSelectionOption.useExisting,
                    sshPubKey: '',
                    sshSecretName: secretName,
                    sshSecretNamespace: selectedProject,
                  }
            }
            namespace={selectedProject}
            onSubmit={onSubmit}
            {...modalProps}
            isUserTab
          />
        ))
      }
      className="project-ssh-row__secret-name"
      icon={<PencilAltIcon />}
      iconPosition="end"
      isDisabled={isEmpty(selectedProject)}
      isInline
      variant={ButtonVariant.link}
    >
      {isEmpty(secretName) ? t('Not configured') : secretName}
    </Button>
  );
};

export default AddProjectAuthKeyButton;
