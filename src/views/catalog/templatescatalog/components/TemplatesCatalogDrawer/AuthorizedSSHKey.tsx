import React, { FC } from 'react';

import useTemplateSecrets from '@catalog/templatescatalog/components/TemplatesCatalogDrawer/hooks/useTemplateSecrets/useTemplateSecrets';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SSHSecretModal from '@kubevirt-utils/components/SSHSecretModal/SSHSecretModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { DescriptionList, HelperText, HelperTextItem, SplitItem } from '@patternfly/react-core';

type AuthorizedSSHKeyProps = {
  authorizedSSHKey: string;
  namespace: string;
};
const AuthorizedSSHKey: FC<AuthorizedSSHKeyProps> = ({ authorizedSSHKey, namespace }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const cluster = useClusterParam();
  const { copyTemplateSecretToTargetNS, loaded, onSSHChange, overwriteTemplateSSHKey, sshDetails } =
    useTemplateSecrets(authorizedSSHKey, namespace, cluster);

  return (
    <SplitItem>
      <DescriptionList>
        <DescriptionItem
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
        {copyTemplateSecretToTargetNS && loaded && (
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
