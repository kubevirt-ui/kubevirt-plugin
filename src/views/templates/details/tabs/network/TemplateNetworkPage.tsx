import React, { FC, useCallback } from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sUpdate, ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Title } from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../hooks/useIsTemplateEditable';

import NetworkInterfaceList from './components/list/NetworkInterfaceList';
import TemplatesNetworkInterfaceModal from './components/modal/TemplatesNetworkInterfaceModal';

import 'src/utils/styles/ListPageCreateButton.scss';
import './template-network-tab.scss';

type TemplateNetworkProps = {
  obj: V1Template;
};

const TemplateNetwork: FC<TemplateNetworkProps> = ({ obj: template }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { isTemplateEditable } = useEditTemplateAccessReview(template);
  const actionText = t('Add network interface');

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

  return (
    <div className="template-network-tab">
      <ListPageBody>
        <SidebarEditor<V1Template> onResourceUpdate={onSubmitTemplate} resource={template}>
          <Title className="list-page-create-button-margin" headingLevel="h2">
            {t('Network interfaces')}
          </Title>

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

          <NetworkInterfaceList template={template} />
        </SidebarEditor>
      </ListPageBody>
    </div>
  );
};

export default TemplateNetwork;
