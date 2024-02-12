import React, { FC, useCallback } from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { CloudInitDescription } from '@kubevirt-utils/components/CloudinitDescription/CloudInitDescription';
import CloudinitModal from '@kubevirt-utils/components/CloudinitModal/CloudinitModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
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
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import useEditTemplateAccessReview from '../../hooks/useIsTemplateEditable';

import SSHKey from './components/SSHKey/SSHKey';
import SysPrepItem from './components/SysPrepItem/SysPrepItem';

import './template-scripts-tab.scss';

type TemplateScriptsPageProps = {
  obj: V1Template;
};

const TemplateScriptsPage: FC<TemplateScriptsPageProps> = ({ obj: template }) => {
  const { t } = useKubevirtTranslation();
  const { isTemplateEditable } = useEditTemplateAccessReview(template);
  const vm = getTemplateVirtualMachineObject(template);

  const { createModal } = useModal();

  const onSubmitTemplate = useCallback(
    (updatedTemplate: V1Template) =>
      k8sUpdate({
        data: updatedTemplate,
        model: TemplateModel,
        name: updatedTemplate?.metadata?.name,
        ns: updatedTemplate?.metadata?.namespace,
      }),
    [],
  );

  const onUpdate = useCallback(
    async (updatedVM: V1VirtualMachine) => {
      await onSubmitTemplate(replaceTemplateVM(template, updatedVM));
    },
    [onSubmitTemplate, template],
  );

  return (
    <PageSection variant={PageSectionVariants.light}>
      <SidebarEditor<V1Template> onResourceUpdate={onSubmitTemplate} resource={template}>
        <DescriptionList className="template-scripts-tab__description-list">
          <DescriptionListGroup>
            <DescriptionListTerm>
              <DescriptionListTermHelpText>
                <Flex className="vm-description-item__title">
                  <FlexItem>
                    <Title headingLevel="h2">{t('Cloud-init')}</Title>
                  </FlexItem>
                  <FlexItem>
                    <Button
                      onClick={() =>
                        createModal(({ isOpen, onClose }) => (
                          <CloudinitModal
                            isOpen={isOpen}
                            onClose={onClose}
                            onSubmit={onUpdate}
                            vm={vm}
                          />
                        ))
                      }
                      isDisabled={!isTemplateEditable}
                      isInline
                      type="button"
                      variant="link"
                    >
                      {t('Edit')}
                      <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
                    </Button>
                  </FlexItem>
                </Flex>
              </DescriptionListTermHelpText>
            </DescriptionListTerm>
            <DescriptionListDescription>
              <CloudInitDescription vm={vm} />
            </DescriptionListDescription>
          </DescriptionListGroup>

          <Divider />
          <SSHKey template={template} />
          <Divider />
          <SysPrepItem template={template} />
        </DescriptionList>
      </SidebarEditor>
    </PageSection>
  );
};

export default TemplateScriptsPage;
