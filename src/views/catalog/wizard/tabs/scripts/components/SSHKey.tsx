import * as React from 'react';
import { Trans } from 'react-i18next';

import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { WizardDescriptionItem } from '@catalog/wizard/components/WizardDescriptionItem';
import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { AuthorizedSSHKeyModal } from '@kubevirt-utils/components/AuthorizedSSHKeyModal/AuthorizedSSHKeyModal';
import { addSecretToVM } from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, Text, TextVariants } from '@patternfly/react-core';

import { changeSecretKey, removeSSHKeyObject, updateSSHKeyObject } from './sshkey-utils';

const SSHKey: React.FC = () => {
  const { vm, updateVM, tabsData, updateTabsData } = useWizardVMContext();
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const vmAttachedSecretName = vm?.spec?.template?.spec?.accessCredentials?.find(
    (ac) => ac?.sshPublicKey?.source?.secret?.secretName,
  )?.sshPublicKey?.source?.secret?.secretName;

  const sshSecretObject = tabsData?.additionalObjects?.find(
    (object) =>
      object?.kind === SecretModel.kind && object?.metadata?.name === vmAttachedSecretName,
  );
  const secretKey = sshSecretObject?.data?.key && atob(sshSecretObject?.data?.key);

  const onSSHChange = (secretName: string, sshKey?: string) => {
    if (!sshKey && !secretName) {
      return updateVM((vmDraft) => {
        vmDraft.spec.template.spec.accessCredentials = null;
      });
    }

    if (secretName) {
      removeSSHKeyObject(updateTabsData, vmAttachedSecretName);
      return updateVM((vmDraft) => {
        return addSecretToVM(vmDraft, secretName);
      });
    }

    if (sshKey) {
      return sshSecretObject
        ? Promise.resolve(changeSecretKey(updateTabsData, sshKey, vmAttachedSecretName))
        : updateSSHKeyObject(vm, updateVM, updateTabsData, sshKey);
    }
  };

  return (
    <WizardDescriptionItem
      testId="wizard-sshkey"
      title={t('Authorized SSH Key')}
      isEdit
      showEditOnTitle
      description={
        <Stack hasGutter>
          <div data-test="ssh-popover">
            <Trans t={t} ns="plugin__kubevirt-plugin">
              <Text component={TextVariants.p}>Store the key in a project secret.</Text>
              <Text component={TextVariants.p}>
                The key will be stored after the machine is created
              </Text>
            </Trans>
          </div>
          <span>{vmAttachedSecretName ? t('Available') : t('Not available')}</span>
        </Stack>
      }
      onEditClick={() =>
        createModal((modalProps) => (
          <AuthorizedSSHKeyModal
            {...modalProps}
            sshKey={secretKey}
            vmSecretName={!sshSecretObject && vmAttachedSecretName}
            onSubmit={onSSHChange}
          />
        ))
      }
    />
  );
};

export default SSHKey;
