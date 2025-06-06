import React, { FC } from 'react';

import useTemplateSecrets from '@catalog/templatescatalog/components/TemplatesCatalogDrawer/hooks/useTemplateSecrets/useTemplateSecrets';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SSHSecretModal from '@kubevirt-utils/components/SSHSecretModal/SSHSecretModal';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DescriptionList, HelperText, HelperTextItem, SplitItem } from '@patternfly/react-core';

type AuthorizedSSHKeyProps = {
  authorizedSSHKey: string;
  namespace: string;
};
const AuthorizedSSHKey: FC<AuthorizedSSHKeyProps> = ({ authorizedSSHKey, namespace }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { copyTemplateSecretToTargetNS, onSSHChange, overwriteTemplateSSHKey, sshDetails } =
    useTemplateSecrets(authorizedSSHKey, namespace);

  return (
    <SplitItem>
      <DescriptionList>
        <VirtualMachineDescriptionItem
          onEditClick={() =>
            createModal((modalProps) => (
              <SSHSecretModal
                {...modalProps}
                initialSSHSecretDetails={sshDetails}
                namespace={namespace}
                onSubmit={onSSHChange}
              />
            ))
          }
          descriptionData={sshDetails?.sshSecretName || t('Not configured')}
          descriptionHeader={t('Public SSH key')}
          isEdit
        />
        {overwriteTemplateSSHKey && (
          <HelperText>
            <HelperTextItem variant="warning">
              {t('This key will override the SSH key secret set on the template')}
            </HelperTextItem>
          </HelperText>
        )}
        {copyTemplateSecretToTargetNS && (
          <HelperText>
            <HelperTextItem variant="warning">
              {t('This Secret will be copied to the destination project')}
            </HelperTextItem>
          </HelperText>
        )}
      </DescriptionList>
    </SplitItem>
  );
};

export default AuthorizedSSHKey;
