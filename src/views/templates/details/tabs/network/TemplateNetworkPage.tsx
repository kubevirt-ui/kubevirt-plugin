import React, { FC } from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { updateTemplate } from '@kubevirt-utils/resources/template';
import { Button, PageSection, Stack, StackItem, Title } from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../hooks/useIsTemplateEditable';

import NetworkInterfaceList from './components/list/NetworkInterfaceList';
import TemplatesNetworkInterfaceModal from './components/modal/TemplatesNetworkInterfaceModal';

type TemplateNetworkProps = {
  obj: V1Template;
};

const TemplateNetwork: FC<TemplateNetworkProps> = ({ obj: template }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { isTemplateEditable } = useEditTemplateAccessReview(template);
  const actionText = t('Add network interface');

  return (
    <PageSection>
      <SidebarEditor<V1Template> onResourceUpdate={updateTemplate} resource={template}>
        <Stack hasGutter>
          <Title headingLevel="h2">{t('Network interfaces')}</Title>
          <StackItem>
            <Button
              onClick={() =>
                createModal(({ isOpen, onClose }) => (
                  <TemplatesNetworkInterfaceModal
                    headerText={actionText}
                    isOpen={isOpen}
                    onClose={onClose}
                    template={template}
                  />
                ))
              }
              className="template-network-tab__button"
              isDisabled={!isTemplateEditable}
            >
              {actionText}
            </Button>
          </StackItem>
          <StackItem>
            <NetworkInterfaceList template={template} />
          </StackItem>
        </Stack>
      </SidebarEditor>
    </PageSection>
  );
};

export default TemplateNetwork;
