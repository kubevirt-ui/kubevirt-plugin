import React, { FC, useMemo } from 'react';
import produce from 'immer';

import { SecretModel, TemplateModel, V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import LinuxLabel from '@kubevirt-utils/components/Labels/LinuxLabel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import SecretNameLabel from '@kubevirt-utils/components/SSHSecretModal/components/SecretNameLabel';
import SSHSecretModal from '@kubevirt-utils/components/SSHSecretModal/SSHSecretModal';
import {
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { createSSHSecret, getInitialSSHDetails } from '@kubevirt-utils/resources/secret/utils';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sUpdate } from '@multicluster/k8sRequests';
import {
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Stack,
  Title,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import useEditTemplateAccessReview from '../../../../hooks/useIsTemplateEditable';

import { removeAccessCredential, updateAccessCredential } from './sshkey-utils';

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

  const onSubmit = async (sshDetails: SSHSecretDetails) => {
    const { secretOption, sshPubKey, sshSecretName } = sshDetails;

    if (isEqualObject(sshDetails, initialSSHDetails)) {
      return Promise.resolve();
    }

    if (secretOption === SecretSelectionOption.addNew) {
      await createSSHSecret(sshPubKey, sshSecretName, getNamespace(template), getCluster(template));
    }

    const newTemplate = produce(template, (draftTemplate) => {
      if (
        secretOption === SecretSelectionOption.none &&
        initialSSHDetails.secretOption !== SecretSelectionOption.none
      ) {
        removeAccessCredential(draftTemplate, initialSSHDetails.sshSecretName);
      }

      if (
        (secretOption === SecretSelectionOption.useExisting ||
          secretOption === SecretSelectionOption.addNew) &&
        initialSSHDetails.sshSecretName !== sshSecretName &&
        !isEmpty(sshSecretName)
      ) {
        updateAccessCredential(draftTemplate, sshSecretName);
      }
    });

    return kubevirtK8sUpdate({
      cluster: getCluster(newTemplate),
      data: newTemplate,
      model: TemplateModel,
      name: getName(newTemplate),
      ns: getNamespace(newTemplate),
    });
  };

  return (
    <DescriptionItem
      descriptionData={
        <Stack hasGutter>
          <div data-test="ssh-popover">
            <Content component={ContentVariants.p}>{t('Select an available secret')}</Content>
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
              icon={<PencilAltIcon />}
              iconPosition="end"
              isDisabled={!isTemplateEditable}
              isInline
              type="button"
              variant={ButtonVariant.link}
            >
              {t('Edit')}
            </Button>
          </FlexItem>
        </Flex>
      }
    />
  );
};

export default SSHKey;
