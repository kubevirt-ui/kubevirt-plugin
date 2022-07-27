import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, ListPageCreateButton } from '@openshift-console/dynamic-plugin-sdk';

import { isCommonVMTemplate } from '../../../utils/utils';

import NetworkInterfaceList from './components/list/NetworkInterfaceList';
import NetworkInterfaceModal from './components/modal/NetworkInterfaceModal';

import 'src/utils/styles/ListPageCreateButton.scss';

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
    <div>
      <ListPageBody>
        <ListPageCreateButton
          className="list-page-create-button-margin"
          isDisabled={isCommonVMTemplate(template)}
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
        <NetworkInterfaceList template={template} />
      </ListPageBody>
    </div>
  );
};

export default TemplateNetwork;
