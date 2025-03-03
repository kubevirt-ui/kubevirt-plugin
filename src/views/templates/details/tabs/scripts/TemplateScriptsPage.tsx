import React, { FC, useCallback } from 'react';
import classnames from 'classnames';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { CloudInitDescription } from '@kubevirt-utils/components/CloudinitDescription/CloudInitDescription';
import CloudinitModal from '@kubevirt-utils/components/CloudinitModal/CloudinitModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateVirtualMachineObject,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  DescriptionList,
  Divider,
  Flex,
  FlexItem,
  PageSection,
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
    <PageSection>
      <SidebarEditor<V1Template> onResourceUpdate={onSubmitTemplate} resource={template}>
        <DescriptionList
          className={classnames(
            'pf-v5-c-description-list',
            'template-scripts-tab__description-list',
          )}
        >
          <VirtualMachineDescriptionItem
            descriptionHeader={
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
                    <PencilAltIcon className="co-icon-space-l pf-v5-c-button-icon--plain" />
                  </Button>
                </FlexItem>
              </Flex>
            }
            descriptionData={<CloudInitDescription vm={vm} />}
          />
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
