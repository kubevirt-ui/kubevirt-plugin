import React, { FC, useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';

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

type TemplateNetworkProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
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
        model: TemplateModel,
        data: updatedTemplate,
        ns: updatedTemplate?.metadata?.namespace,
        name: updatedTemplate?.metadata?.name,
      }),
    [],
  );

  return (
    <div className="template-network-tab">
      <ListPageBody>
        <SidebarEditor<V1Template> resource={template} onResourceUpdate={onSubmitTemplate}>
          <Title headingLevel="h2" className="list-page-create-button-margin">
            {t('Network interfaces')}
          </Title>

          <Button
            className="template-network-tab__button"
            isDisabled={!isTemplateEditable}
            onClick={() =>
              createModal(({ isOpen, onClose }) => (
                <TemplatesNetworkInterfaceModal
                  isOpen={isOpen}
                  onClose={onClose}
                  headerText={actionText}
                  template={template}
                />
              ))
            }
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
