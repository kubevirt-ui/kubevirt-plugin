import React, { FC, useCallback, useMemo, useState } from 'react';
import { Trans } from 'react-i18next';

import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { WizardDescriptionItem } from '@catalog/wizard/components/WizardDescriptionItem';
import LinuxLabel from '@kubevirt-utils/components/Labels/LinuxLabel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import SecretNameLabel from '@kubevirt-utils/components/SSHSecretSection/components/SecretNameLabel/SecretNameLabel';
import SSHSecretModal from '@kubevirt-utils/components/SSHSecretSection/SSHSecretModal';
import {
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import {
  addSecretToVM,
  removeSecretToVM,
} from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { SecretModel } from '@kubevirt-utils/models';
import { getInitialSSHDetails } from '@kubevirt-utils/resources/secret/utils';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Stack, Text, TextVariants } from '@patternfly/react-core';

import { removeSSHKeyObject, updateSSHKeyObject } from './sshkey-utils';

const SSHKey: FC = () => {
  const { t } = useKubevirtTranslation();
  const { tabsData, updateTabsData, updateVM, vm } = useWizardVMContext();
  const { createModal } = useModal();

  const vmAttachedSecretName = useMemo(() => getVMSSHSecretName(vm), [vm]);

  const [sshDetails, setSSHDetails] = useState<SSHSecretDetails>(
    getInitialSSHDetails({
      applyKeyToProject: tabsData.applySSHToSettings,
      secretToCreate: tabsData.additionalObjects?.find((obj) => obj?.kind === SecretModel.kind),
      sshSecretName: vmAttachedSecretName,
    }),
  );

  const onSubmit = useCallback(
    async (details: SSHSecretDetails) => {
      const { applyKeyToProject, secretOption, sshPubKey, sshSecretName } = details;

      if (isEqualObject(details, sshDetails)) {
        return;
      }

      removeSSHKeyObject(updateTabsData, sshDetails.sshSecretName);
      updateTabsData((currentTabsData) => {
        currentTabsData.authorizedSSHKey = sshSecretName;
        currentTabsData.applySSHToSettings = applyKeyToProject;
      });

      if (
        secretOption === SecretSelectionOption.none &&
        sshDetails.secretOption !== SecretSelectionOption.none
      ) {
        await updateVM(removeSecretToVM(vm));
      }

      if (
        secretOption === SecretSelectionOption.useExisting &&
        sshDetails.sshSecretName !== sshSecretName &&
        !isEmpty(sshSecretName)
      ) {
        await updateVM(addSecretToVM(vm, sshSecretName));
      }

      if (
        secretOption === SecretSelectionOption.addNew &&
        !isEmpty(sshPubKey) &&
        !isEmpty(sshSecretName)
      ) {
        updateSSHKeyObject(vm, updateTabsData, sshPubKey, sshSecretName);
        await updateVM(addSecretToVM(vm, sshSecretName));
      }

      setSSHDetails(details);
      return Promise.resolve();
    },
    [sshDetails, updateTabsData, updateVM, vm],
  );

  return (
    <WizardDescriptionItem
      description={
        <Stack hasGutter>
          <div data-test="ssh-popover">
            <Trans ns="plugin__kubevirt-plugin" t={t}>
              <Text component={TextVariants.p}>Store the key in a project secret.</Text>
              <Text component={TextVariants.p}>
                The key will be stored after the machine is created
              </Text>
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
