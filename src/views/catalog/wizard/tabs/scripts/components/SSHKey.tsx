import React, { FC, useCallback, useMemo } from 'react';
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
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
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

  const [authorizedSSHKeys, updateAuthorizedSSHKeys] = useKubevirtUserSettings('ssh');

  const vmAttachedSecretName = useMemo(() => getVMSSHSecretName(vm), [vm]);

  const initialSSHDetails: SSHSecretDetails = useMemo(
    () =>
      getInitialSSHDetails({
        applyKeyToProject:
          !isEmpty(vmAttachedSecretName) && tabsData?.authorizedSSHKey === vmAttachedSecretName,
        secretToCreate: tabsData.additionalObjects?.find((obj) => obj?.kind === SecretModel.kind),
        sshSecretName: vmAttachedSecretName,
      }),
    [tabsData, vmAttachedSecretName],
  );

  const onSubmit = useCallback(
    (sshDetails: SSHSecretDetails) => {
      const { applyKeyToProject, secretOption, sshPubKey, sshSecretName } = sshDetails;

      if (isEqualObject(sshDetails, initialSSHDetails)) {
        return Promise.resolve();
      }

      const vmNamespace = getNamespace(vm);
      if (applyKeyToProject) {
        updateAuthorizedSSHKeys({ ...authorizedSSHKeys, [vmNamespace]: sshSecretName });
        updateTabsData((currentTabsData) => {
          currentTabsData.authorizedSSHKey = sshSecretName;
        });
      }

      if (!applyKeyToProject && !isEmpty(tabsData.authorizedSSHKey)) {
        const updatedAuthKeys = { ...authorizedSSHKeys };
        delete updatedAuthKeys?.[vmNamespace];
        updateAuthorizedSSHKeys(updatedAuthKeys);
        updateTabsData((currentTabsData) => {
          currentTabsData.authorizedSSHKey = null;
        });
      }

      removeSSHKeyObject(updateTabsData, initialSSHDetails.sshSecretName);

      if (
        secretOption === SecretSelectionOption.none &&
        initialSSHDetails.secretOption !== SecretSelectionOption.none
      ) {
        return updateVM(removeSecretToVM(vm));
      }

      if (
        secretOption === SecretSelectionOption.useExisting &&
        initialSSHDetails.sshSecretName !== sshSecretName &&
        !isEmpty(sshSecretName)
      ) {
        return updateVM(addSecretToVM(vm, sshSecretName));
      }

      if (
        secretOption === SecretSelectionOption.addNew &&
        !isEmpty(sshPubKey) &&
        !isEmpty(sshSecretName)
      ) {
        updateSSHKeyObject(vm, updateTabsData, sshPubKey, sshSecretName);
        return updateVM(addSecretToVM(vm, sshSecretName));
      }

      return Promise.resolve();
    },
    [
      authorizedSSHKeys,
      initialSSHDetails,
      tabsData.authorizedSSHKey,
      updateAuthorizedSSHKeys,
      updateTabsData,
      updateVM,
      vm,
    ],
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
            initialSSHSecretDetails={initialSSHDetails}
            namespace={getNamespace(vm)}
            onSubmit={onSubmit}
          />
        ))
      }
      isEdit
      label={<LinuxLabel />}
      showEditOnTitle
      testId="wizard-sshkey"
      title={t('Authorized SSH key')}
    />
  );
};

export default SSHKey;
