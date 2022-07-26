import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import produce from 'immer';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { AuthorizedSSHKeyModal } from '@kubevirt-utils/components/AuthorizedSSHKeyModal/AuthorizedSSHKeyModal';
import { CloudInitDescription } from '@kubevirt-utils/components/CloudinitDescription/CloudInitDescription';
import { CloudinitModal } from '@kubevirt-utils/components/CloudinitModal/CloudinitModal';
import { addSecretToVM } from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateVirtualMachineObject,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListTermHelpText,
  Divider,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  PageSection,
  Stack,
  Text,
  TextVariants,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import { isCommonVMTemplate } from '../../../utils/utils';

import SysPrepItem from './SysPrepItem';

type TemplateScriptsPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj: V1Template;
};

const TemplateScriptsPage: React.FC<TemplateScriptsPageProps> = ({ obj: template }) => {
  const { t } = useKubevirtTranslation();
  const isEditDisabled = isCommonVMTemplate(template);
  const vm = getTemplateVirtualMachineObject(template);

  const vmAttachedSecretName = vm?.spec?.template?.spec?.accessCredentials?.find(
    (ac) => ac?.sshPublicKey?.source?.secret?.secretName,
  )?.sshPublicKey?.source?.secret?.secretName;

  const { createModal } = useModal();

  const onSubmit = React.useCallback(
    async (updatedVM: V1VirtualMachine) => {
      const updatedTemplate = replaceTemplateVM(template, updatedVM);
      await k8sUpdate({
        model: TemplateModel,
        data: updatedTemplate,
        ns: template?.metadata?.namespace,
        name: template?.metadata?.name,
      });
    },
    [template],
  );

  const onSSHChange = async (serviceName: string) => {
    let updatedTemplate = undefined;
    if (serviceName) {
      updatedTemplate = replaceTemplateVM(template, addSecretToVM(vm, serviceName));
    } else {
      if (!vmAttachedSecretName) return;

      updatedTemplate = produce(template, (draftTemplate) => {
        getTemplateVirtualMachineObject(draftTemplate).spec.template.spec.accessCredentials = null;
      });
    }

    await k8sUpdate({
      model: TemplateModel,
      data: updatedTemplate,
      ns: template?.metadata?.namespace,
      name: template?.metadata?.name,
    });
  };

  return (
    <PageSection>
      <Grid hasGutter>
        <GridItem span={5}>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>
                <DescriptionListTermHelpText>
                  <Flex className="vm-description-item__title">
                    <FlexItem>{t('Cloud-init')}</FlexItem>
                    {!isEditDisabled && (
                      <FlexItem>
                        <Button
                          type="button"
                          isInline
                          onClick={() =>
                            createModal(({ isOpen, onClose }) => (
                              <CloudinitModal
                                vm={vm}
                                isOpen={isOpen}
                                onClose={onClose}
                                onSubmit={onSubmit}
                              />
                            ))
                          }
                          variant="link"
                        >
                          {t('Edit')}
                          <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
                        </Button>
                      </FlexItem>
                    )}
                  </Flex>
                </DescriptionListTermHelpText>
              </DescriptionListTerm>
              <DescriptionListDescription>
                <CloudInitDescription vm={vm} />
              </DescriptionListDescription>
            </DescriptionListGroup>

            <Divider />
            <DescriptionListGroup>
              <DescriptionListTerm>
                <DescriptionListTermHelpText>
                  <Flex className="vm-description-item__title">
                    <FlexItem>{t('Authorized SSH Key')}</FlexItem>
                    {!isEditDisabled && (
                      <FlexItem>
                        <Button
                          type="button"
                          isInline
                          onClick={() =>
                            createModal((modalProps) => (
                              <AuthorizedSSHKeyModal
                                {...modalProps}
                                enableCreation={false}
                                vmSecretName={vmAttachedSecretName}
                                onSubmit={onSSHChange}
                              />
                            ))
                          }
                          variant="link"
                        >
                          {t('Edit')}
                          <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
                        </Button>
                      </FlexItem>
                    )}
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
            <Divider />
            <SysPrepItem template={template} />
          </DescriptionList>
        </GridItem>
      </Grid>
    </PageSection>
  );
};

export default TemplateScriptsPage;
