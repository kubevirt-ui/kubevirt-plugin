import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { isCommonTemplate } from 'src/views/clusteroverview/overview/components/inventory-card/utils/flattenTemplates';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageBody,
  ListPageCreateButton,
  ListPageHeader,
} from '@openshift-console/dynamic-plugin-sdk';

import NetworkInterfaceList from './components/list/NetworkInterfaceList';
import NetworkInterfaceModal from './components/modal/NetworkInterfaceModal';

type TemplateNetworkProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj: V1Template;
};

const TemplateNetwork: React.FC<TemplateNetworkProps> = ({ obj: template }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const actionText = t('Add Network Interface');

  return (
    <div className="template-network-tab">
      <ListPageHeader title="">
        <ListPageCreateButton
          isDisabled={isCommonTemplate(template)}
          onClick={() =>
            createModal(({ isOpen, onClose }) => (
              <NetworkInterfaceModal
                isOpen={isOpen}
                onClose={onClose}
                headerText={actionText}
                template={template}
              />
            ))
          }
        >
          {actionText}
        </ListPageCreateButton>
      </ListPageHeader>
      <ListPageBody>
        <NetworkInterfaceList template={template} />
      </ListPageBody>
    </div>
  );
};

export default TemplateNetwork;
