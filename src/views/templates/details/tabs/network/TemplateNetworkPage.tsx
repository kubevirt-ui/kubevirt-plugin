import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sUpdate, ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Flex, FlexItem } from '@patternfly/react-core';

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

const TemplateNetwork: React.FC<TemplateNetworkProps> = ({ obj: template }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { isTemplateEditable } = useEditTemplateAccessReview(template);
  const actionText = t('Add network interface');

  const onSubmitTemplate = React.useCallback(
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
          <Flex className="list-page-create-button-margin">
            <FlexItem>
              <Button
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
            </FlexItem>
            <FlexItem>
              <SidebarEditorSwitch />
            </FlexItem>
          </Flex>
          <NetworkInterfaceList template={template} />
        </SidebarEditor>
      </ListPageBody>
    </div>
  );
};

export default TemplateNetwork;
