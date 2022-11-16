import React, { FC, useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { CloudInitDescription } from '@kubevirt-utils/components/CloudinitDescription/CloudInitDescription';
import { CloudinitModal } from '@kubevirt-utils/components/CloudinitModal/CloudinitModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateVirtualMachineObject,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListTermHelpText,
  Divider,
  Flex,
  FlexItem,
  PageSection,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import ButtonWithPermissionTooltip from '../../ButtonWithPermissionTooltip';

import SSHKey from './components/SSHKey/SSHKey';
import SysPrepItem from './components/SysPrepItem/SysPrepItem';

import './template-scripts-tab.scss';

type TemplateScriptsPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj: V1Template;
};

const TemplateScriptsPage: FC<TemplateScriptsPageProps> = ({ obj: template }) => {
  const { t } = useKubevirtTranslation();
  const vm = getTemplateVirtualMachineObject(template);

  const { createModal } = useModal();

  const onSubmitTemplate = useCallback(
    (updatedTemplate: V1Template) =>
      k8sUpdate({
        model: TemplateModel,
        data: updatedTemplate,
        ns: updatedTemplate?.metadata?.namespace,
        name: updatedTemplate?.metadata?.name,
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
    <PageSection>
      <SidebarEditor<V1Template> resource={template} onResourceUpdate={onSubmitTemplate}>
        <SidebarEditorSwitch />
        <DescriptionList className="template-scripts-tab__description-list margin-top">
          <DescriptionListGroup>
            <DescriptionListTerm>
              <DescriptionListTermHelpText>
                <Flex className="vm-description-item__title">
                  <FlexItem>{t('Cloud-init')}</FlexItem>
                  <FlexItem>
                    <ButtonWithPermissionTooltip
                      template={template}
                      type="button"
                      isInline
                      onClick={() =>
                        createModal(({ isOpen, onClose }) => (
                          <CloudinitModal
                            vm={vm}
                            isOpen={isOpen}
                            onClose={onClose}
                            onSubmit={onUpdate}
                          />
                        ))
                      }
                      variant="link"
                    >
                      {t('Edit')}
                      <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
                    </ButtonWithPermissionTooltip>
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
