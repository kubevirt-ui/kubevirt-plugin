import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Trans } from 'react-i18next';

import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { WizardDescriptionItem } from '@catalog/wizard/components/WizardDescriptionItem';
import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import LinuxLabel from '@kubevirt-utils/components/Labels/LinuxLabel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import SecretNameLabel from '@kubevirt-utils/components/SSHSecretSection/components/SecretNameLabel/SecretNameLabel';
import SSHSecretModal from '@kubevirt-utils/components/SSHSecretSection/SSHSecretModal';
import { initialSSHCredentials } from '@kubevirt-utils/components/SSHSecretSection/utils/constants';
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

  const [authorizedSSHKeys, updateAuthorizedSSHKeys, loaded] = useKubevirtUserSettings('ssh');

  const vmAttachedSecretName = useMemo(() => getVMSSHSecretName(vm), [vm]);

  const [initialSSHDetails, setInitialSSHDetails] = useState(initialSSHCredentials);

  useEffect(() => {
    if (loaded && !initialSSHDetails?.appliedDefaultKey) {
      const userSettingSSHKeySecretName: string = authorizedSSHKeys?.[getNamespace(vm)];
      const secretToCreate: IoK8sApiCoreV1Secret =
        isEmpty(userSettingSSHKeySecretName) &&
        tabsData.additionalObjects.find((obj) => obj.kind === SecretModel.kind);
      setInitialSSHDetails(
        getInitialSSHDetails({
          secretToCreate,
          sshSecretName: userSettingSSHKeySecretName,
        }),
      );
      !isEmpty(userSettingSSHKeySecretName) &&
        updateVM(addSecretToVM(vm, userSettingSSHKeySecretName));
    }
  }, [
    authorizedSSHKeys,
    initialSSHDetails?.appliedDefaultKey,
    loaded,
    tabsData.additionalObjects,
    updateVM,
    vm,
  ]);

  const onSubmit = useCallback(
    (sshDetails: SSHSecretDetails, applyKeyToProject: boolean) => {
      const { secretOption, sshPubKey, sshSecretName } = sshDetails;

      if (isEqualObject(sshDetails, initialSSHDetails)) {
        return Promise.resolve();
      }

      const vmNamespace = getNamespace(vm);
      if (applyKeyToProject && authorizedSSHKeys?.[vmNamespace] !== sshSecretName) {
        updateAuthorizedSSHKeys({ ...authorizedSSHKeys, [vmNamespace]: sshSecretName });
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
    [authorizedSSHKeys, initialSSHDetails, updateAuthorizedSSHKeys, updateTabsData, updateVM, vm],
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
