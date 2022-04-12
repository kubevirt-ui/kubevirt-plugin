import * as React from 'react';

import { WizardTab } from '@catalog/wizard/tabs';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageBody,
  ListPageCreateButton,
  ListPageHeader,
} from '@openshift-console/dynamic-plugin-sdk';

import NetworkInterfaceList from './components/list/NetworkInterfaceList';
import NetworkInterfaceModal from './components/modal/NetworkInterfaceModal';

const WizardNetworkTab: WizardTab = ({ vm, updateVM }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const actionText = t('Add Network Interface');
  return (
    <>
      <ListPageHeader title="">
        <ListPageCreateButton
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
      </ListPageHeader>
      <ListPageBody>
        <NetworkInterfaceList vm={vm} />
      </ListPageBody>
    </>
  );
};

export default WizardNetworkTab;
