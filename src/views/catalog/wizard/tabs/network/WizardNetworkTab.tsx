import * as React from 'react';
import { WizardVMContextType } from 'src/views/catalog/utils/WizardVMContext';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageBody,
  ListPageCreateButton,
  ListPageHeader,
} from '@openshift-console/dynamic-plugin-sdk';

import NetworkInterfaceList from './components/list/NetworkInterfaceList';
import NetworkInterfaceModal from './components/modal/NetworkInterfaceModal';

const WizardNetworkTab: React.FC<WizardVMContextType> = ({ vm, updateVM }) => {
  const { t } = useKubevirtTranslation();

  const actionText = t('Add Network Interface');
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <ListPageHeader title="">
        <ListPageCreateButton onClick={() => setIsOpen(true)}>{actionText}</ListPageCreateButton>
      </ListPageHeader>
      <ListPageBody>
        <NetworkInterfaceList vm={vm} />
      </ListPageBody>
      {isOpen && (
        <NetworkInterfaceModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          headerText={actionText}
          vm={vm}
          updateVM={updateVM}
        />
      )}
    </>
  );
};

export default WizardNetworkTab;
