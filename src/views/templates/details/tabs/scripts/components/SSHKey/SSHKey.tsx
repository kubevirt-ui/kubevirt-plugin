import React, { FC } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { AuthorizedSSHKeyModal } from '@kubevirt-utils/components/AuthorizedSSHKeyModal/AuthorizedSSHKeyModal';
import LinuxLabel from '@kubevirt-utils/components/Labels/LinuxLabel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { isEmpty } from '@kubevirt-utils/utils/utils';
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

import { changeSSHKeySecret, getTemplateSSHKeySecret } from './sshkey-utils';

type SSHKeyProps = {
  template: V1Template;
};

const SSHKey: FC<SSHKeyProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const { isTemplateEditable } = useEditTemplateAccessReview(template);
  const vm = getTemplateVirtualMachineObject(template);

  const vmAttachedSecretName = vm?.spec?.template?.spec?.accessCredentials?.find(
    (ac) => ac?.sshPublicKey?.source?.secret?.secretName,
  )?.sshPublicKey?.source?.secret?.secretName;
  const sshKeySecretObject = getTemplateSSHKeySecret(template, vmAttachedSecretName);

  const secretKey = sshKeySecretObject?.data?.key && atob(sshKeySecretObject?.data?.key);
  const externalSecretName = isEmpty(sshKeySecretObject) && vmAttachedSecretName;

  const { createModal } = useModal();

  const onSSHChange = (secretName: string, sshKey: string) =>
    changeSSHKeySecret(template, secretName, sshKey, vmAttachedSecretName);

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
                    <AuthorizedSSHKeyModal
                      {...modalProps}
                      namespace={vm?.metadata?.namespace || DEFAULT_NAMESPACE}
                      sshKey={secretKey}
                      vmSecretName={externalSecretName}
                      onSubmit={onSSHChange}
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
