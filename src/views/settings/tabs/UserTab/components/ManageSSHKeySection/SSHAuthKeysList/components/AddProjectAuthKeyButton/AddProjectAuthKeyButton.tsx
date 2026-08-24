import React, { type FC } from 'react';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SSHSecretModal from '@kubevirt-utils/components/SSHSecretModal/SSHSecretModal';
import { initialSSHCredentials } from '@kubevirt-utils/components/SSHSecretModal/utils/constants';
import {
  SecretSelectionOption,
  type SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

type AddProjectAuthKeyButtonProps = {
  cluster?: string;
  onSubmit: (sshDetails: SSHSecretDetails) => Promise<unknown>;
  secretName: string;
  selectedProject: string;
};

const AddProjectAuthKeyButton: FC<AddProjectAuthKeyButtonProps> = ({
  cluster,
  onSubmit,
  secretName,
  selectedProject,
}) => {
  const { t } = useKubevirtTranslation();

  const { createModal } = useModal();
  return (
    <Button
      className="project-ssh-row__secret-name"
      icon={<PencilAltIcon />}
      iconPosition="end"
      isDisabled={isEmpty(selectedProject)}
      isInline
      onClick={() =>
        createModal((modalProps) => (
          <SSHSecretModal
            cluster={cluster}
            initialSSHSecretDetails={
              isEmpty(secretName)
                ? initialSSHCredentials
                : {
                    applyKeyToProject: true,
                    secretOption: SecretSelectionOption.UseExisting,
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
      variant={ButtonVariant.link}
    >
      {isEmpty(secretName) ? t('Not configured') : secretName}
    </Button>
  );
};

export default AddProjectAuthKeyButton;
