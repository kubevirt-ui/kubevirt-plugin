import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { WizardDescriptionItem } from '@catalog/wizard/components/WizardDescriptionItem';
import useTemplateWizardSecrets from '@catalog/wizard/tabs/scripts/hooks/useTemplateWizardSecrets';
import LinuxLabel from '@kubevirt-utils/components/Labels/LinuxLabel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SecretNameLabel from '@kubevirt-utils/components/SSHSecretModal/components/SecretNameLabel';
import SSHSecretModal from '@kubevirt-utils/components/SSHSecretModal/SSHSecretModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { Content, ContentVariants, Stack } from '@patternfly/react-core';

const SSHKey: FC = () => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { onSubmit, sshDetails, vm, vmAttachedSecretName } = useTemplateWizardSecrets();

  return (
    <WizardDescriptionItem
      description={
        <Stack hasGutter>
          <div data-test="ssh-popover">
            <Trans ns="plugin__kubevirt-plugin" t={t}>
              <Content component={ContentVariants.p}>Store the key in a project secret.</Content>
              <Content component={ContentVariants.p}>
                The key will be stored after the machine is created
              </Content>
            </Trans>
          </div>
          <SecretNameLabel secretName={vmAttachedSecretName} />
        </Stack>
      }
      onEditClick={() =>
        createModal((modalProps) => (
          <SSHSecretModal
            {...modalProps}
            initialSSHSecretDetails={sshDetails}
            namespace={getNamespace(vm)}
            onSubmit={onSubmit}
          />
        ))
      }
      isEdit
      label={<LinuxLabel />}
      showEditOnTitle
      testId="wizard-sshkey"
      title={t('Public SSH key')}
    />
  );
};

export default SSHKey;
