import React, { FC, useCallback, useMemo } from 'react';
import { Trans } from 'react-i18next';

import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { WizardDescriptionItem } from '@catalog/wizard/components/WizardDescriptionItem';
import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import LinuxLabel from '@kubevirt-utils/components/Labels/LinuxLabel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
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
import { getInitialSSHDetails } from '@kubevirt-utils/resources/secret/utils';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Stack, Text, TextVariants } from '@patternfly/react-core';

import { removeSSHKeyObject, updateSSHKeyObject } from './sshkey-utils';

const SSHKey: FC = () => {
  const { t } = useKubevirtTranslation();
  const { vm, tabsData, updateVM, updateTabsData } = useWizardVMContext();
  const { createModal } = useModal();

  const sshSecretToCreate: IoK8sApiCoreV1Secret = useMemo(
    () => tabsData.additionalObjects.find((obj) => obj.kind === SecretModel.kind),
    [tabsData.additionalObjects],
  );

  const vmAttachedSecretName = useMemo(() => getVMSSHSecretName(vm), [vm]);

  const initialSSHDetails = useMemo(
    () => getInitialSSHDetails(vmAttachedSecretName, sshSecretToCreate),
    [vmAttachedSecretName, sshSecretToCreate],
  );

  const onSubmit = useCallback(
    (sshDetails: SSHSecretDetails) => {
      const { secretOption, sshPubKey, sshSecretName } = sshDetails;

      if (isEqualObject(sshDetails, initialSSHDetails)) {
        return Promise.resolve();
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
    },
    [initialSSHDetails, updateTabsData, updateVM, vm],
  );

  return (
    <WizardDescriptionItem
      testId="wizard-sshkey"
      title={t('Authorized SSH key')}
      isEdit
      label={<LinuxLabel />}
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
          <SSHSecretModal
            {...modalProps}
            initialSSHSecretDetails={initialSSHDetails}
            onSubmit={onSubmit}
            namespace={getNamespace(vm)}
          />
        ))
      }
    />
  );
};

export default SSHKey;
