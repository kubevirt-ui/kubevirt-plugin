import * as React from 'react';

import { WizardTab } from '@catalog/wizard/tabs';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, ListPageCreateButton } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem } from '@patternfly/react-core';

import NetworkInterfaceList from './components/list/NetworkInterfaceList';
import WizardNetworkInterfaceModal from './components/modal/WizardNetworkInterfaceModal';

import 'src/utils/styles/ListPageCreateButton.scss';
import './wizard-network-tab.scss';

const WizardNetworkTab: WizardTab = ({ vm, updateVM }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const actionText = t('Add network interface');
  return (
    <div className="wizard-network-tab">
      <ListPageBody>
        <SidebarEditor resource={vm} onResourceUpdate={(newVM) => updateVM(newVM)}>
          <Flex>
            <FlexItem>
              <ListPageCreateButton
                className="list-page-create-button-margin"
                onClick={() =>
                  createModal(({ isOpen, onClose }) => (
                    <WizardNetworkInterfaceModal
                      isOpen={isOpen}
                      onClose={onClose}
                      headerText={actionText}
                      vm={vm}
                      updateVM={updateVM}
                    />
                  ))
                }
              >
                {actionText}
              </ListPageCreateButton>
            </FlexItem>
            <FlexItem>
              <SidebarEditorSwitch />
            </FlexItem>
          </Flex>
          <NetworkInterfaceList vm={vm} />
        </SidebarEditor>
      </ListPageBody>
    </div>
  );
};

export default WizardNetworkTab;
