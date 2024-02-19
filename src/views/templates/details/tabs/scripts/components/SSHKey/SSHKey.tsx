import React, { FC, useMemo } from 'react';
import produce from 'immer';

import { SecretModel, TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import LinuxLabel from '@kubevirt-utils/components/Labels/LinuxLabel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import SecretNameLabel from '@kubevirt-utils/components/SSHSecretSection/components/SecretNameLabel/SecretNameLabel';
import SSHSecretModal from '@kubevirt-utils/components/SSHSecretSection/SSHSecretModal';
import {
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInitialSSHDetails } from '@kubevirt-utils/resources/secret/utils';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  Stack,
  Text,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import useEditTemplateAccessReview from '../../../../hooks/useIsTemplateEditable';

import {
  removeCredential,
  removeSecretObject,
  updateSecretName,
  updateSSHKeyObject,
} from './sshkey-utils';

type SSHKeyProps = {
  template: V1Template;
};

const SSHKey: FC<SSHKeyProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { isTemplateEditable } = useEditTemplateAccessReview(template);
  const vm = getTemplateVirtualMachineObject(template);

  const vmAttachedSecretName = useMemo(() => getVMSSHSecretName(vm), [vm]);

  const secretToCreate: IoK8sApiCoreV1Secret = useMemo(
    () => template?.objects?.find((obj) => obj.kind === SecretModel.kind),
    [template.objects],
  );

  const initialSSHDetails = useMemo(
    () => getInitialSSHDetails({ secretToCreate, sshSecretName: vmAttachedSecretName }),
    [vmAttachedSecretName, secretToCreate],
  );

  const onSubmit = (sshDetails: SSHSecretDetails) => {
    const { secretOption, sshPubKey, sshSecretName } = sshDetails;

    if (isEqualObject(sshDetails, initialSSHDetails)) {
      return Promise.resolve();
    }

    const newTemplate = produce(template, (draftTemplate) => {
      removeSecretObject(draftTemplate, initialSSHDetails.sshSecretName);

      if (
        secretOption === SecretSelectionOption.none &&
        initialSSHDetails.secretOption !== SecretSelectionOption.none
      ) {
        removeCredential(draftTemplate, initialSSHDetails.sshSecretName);
      }

      if (
        secretOption === SecretSelectionOption.useExisting &&
        initialSSHDetails.sshSecretName !== sshSecretName &&
        !isEmpty(sshSecretName)
      ) {
        updateSecretName(draftTemplate, sshSecretName);
      }

      if (
        secretOption === SecretSelectionOption.addNew &&
        !isEmpty(sshPubKey) &&
        !isEmpty(sshSecretName)
      ) {
        updateSSHKeyObject(
          draftTemplate,
          sshPubKey,
          initialSSHDetails.sshSecretName,
          sshSecretName,
        );
      }
    });

    return k8sUpdate({
      data: newTemplate,
      model: TemplateModel,
      name: getName(newTemplate),
      ns: getNamespace(newTemplate),
    });
  };

  return (
    <VirtualMachineDescriptionItem
      descriptionData={
        <Stack hasGutter>
          <div data-test="ssh-popover">
            <Text component={TextVariants.p}>{t('Select an available secret')}</Text>
          </div>
          <SecretNameLabel secretName={vmAttachedSecretName} />
        </Stack>
      }
      descriptionHeader={
        <Flex className="vm-description-item__title">
          <FlexItem>
            <Title headingLevel="h2">
              {t('Public SSH key')} {<LinuxLabel />}
            </Title>
          </FlexItem>
          <FlexItem>
            <Button
              onClick={() =>
                createModal((modalProps) => (
                  <SSHSecretModal
                    {...modalProps}
                    initialSSHSecretDetails={initialSSHDetails}
                    isTemplate
                    namespace={getNamespace(template)}
                    onSubmit={onSubmit}
                  />
                ))
              }
              isDisabled={!isTemplateEditable}
              isInline
              type="button"
              variant={ButtonVariant.link}
            >
              {t('Edit')}
              <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
            </Button>
          </FlexItem>
        </Flex>
      }
    />
  );
};

export default SSHKey;
