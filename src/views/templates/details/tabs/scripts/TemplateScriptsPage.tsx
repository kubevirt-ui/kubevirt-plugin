import React, { FC, useCallback } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { CloudInitDescription } from '@kubevirt-utils/components/CloudinitDescription/CloudInitDescription';
import CloudinitModal from '@kubevirt-utils/components/CloudinitModal/CloudinitModal';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateVirtualMachineObject,
  replaceTemplateVM,
  updateTemplate,
} from '@kubevirt-utils/resources/template';
import {
  Button,
  ButtonVariant,
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

  const onUpdate = useCallback(
    async (updatedVM: V1VirtualMachine) => {
      await updateTemplate(replaceTemplateVM(template, updatedVM));
    },
    [template],
  );

  return (
    <PageSection>
      <SidebarEditor<V1Template> onResourceUpdate={updateTemplate} resource={template}>
        <DescriptionList className="template-scripts-tab__description-list">
          <DescriptionItem
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
