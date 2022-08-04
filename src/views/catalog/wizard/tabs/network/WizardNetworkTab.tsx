import * as React from 'react';

import { WizardTab } from '@catalog/wizard/tabs';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, ListPageCreateButton } from '@openshift-console/dynamic-plugin-sdk';

import NetworkInterfaceList from './components/list/NetworkInterfaceList';
import NetworkInterfaceModal from './components/modal/NetworkInterfaceModal';

import 'src/utils/styles/ListPageCreateButton.scss';

const WizardNetworkTab: WizardTab = ({ vm, updateVM }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const actionText = t('Add network interface');
  return (
    <>
      <ListPageBody>
        <ListPageCreateButton
          className="list-page-create-button-margin"
          onClick={() =>
            createModal(({ isOpen, onClose }) => (
              <NetworkInterfaceModal
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
      </ListPageBody>
    </>
  );
};

export default WizardNetworkTab;
