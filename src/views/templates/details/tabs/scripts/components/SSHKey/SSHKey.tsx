import React, { FC, useMemo } from 'react';
import produce from 'immer';

import { SecretModel, TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import LinuxLabel from '@kubevirt-utils/components/Labels/LinuxLabel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import SSHSecretModal from '@kubevirt-utils/components/SSHSecretSection/SSHSecretModal';
import {
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretSection/utils/types';
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
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListTermHelpText,
  Flex,
  FlexItem,
  Stack,
  Text,
  TextVariants,
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

  const sshSecretToCreate: IoK8sApiCoreV1Secret = useMemo(
    () => template?.objects?.find((obj) => obj.kind === SecretModel.kind),
    [template.objects],
  );

  const initialSSHDetails = useMemo(
    () => getInitialSSHDetails(vmAttachedSecretName, sshSecretToCreate),
    [vmAttachedSecretName, sshSecretToCreate],
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
      model: TemplateModel,
      data: newTemplate,
      ns: getNamespace(newTemplate),
      name: getName(newTemplate),
    });
  };

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>
        <DescriptionListTermHelpText>
          <Flex className="vm-description-item__title">
            <FlexItem>
              {t('Authorized SSH key')}
              {<LinuxLabel />}
            </FlexItem>
            <FlexItem>
              <Button
                type="button"
                isInline
                isDisabled={!isTemplateEditable}
                onClick={() =>
                  createModal((modalProps) => (
                    <SSHSecretModal
                      {...modalProps}
                      initialSSHSecretDetails={initialSSHDetails}
                      onSubmit={onSubmit}
                      namespace={getNamespace(template)}
                    />
                  ))
                }
                variant={ButtonVariant.link}
              >
                {t('Edit')}
                <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
              </Button>
            </FlexItem>
          </Flex>
        </DescriptionListTermHelpText>
      </DescriptionListTerm>
      <DescriptionListDescription>
        <Stack hasGutter>
          <div data-test="ssh-popover">
            <Text component={TextVariants.p}>{t('Select an available secret')}</Text>
          </div>
          <span>{vmAttachedSecretName ? t('Available') : t('Not available')}</span>
        </Stack>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default SSHKey;
