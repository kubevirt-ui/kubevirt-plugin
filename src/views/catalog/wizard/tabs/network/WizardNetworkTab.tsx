import * as React from 'react';

import { WizardTab } from '@catalog/wizard/tabs';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { ListPageBody, ListPageCreateButton } from '@openshift-console/dynamic-plugin-sdk';

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
        <SidebarEditor
          resource={vm}
          onResourceUpdate={(newVM) => updateVM(newVM)}
          pathsToHighlight={PATHS_TO_HIGHLIGHT.NETWORK_TAB}
        >
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

          <NetworkInterfaceList vm={vm} />
        </SidebarEditor>
      </ListPageBody>
    </div>
  );
};

export default WizardNetworkTab;
