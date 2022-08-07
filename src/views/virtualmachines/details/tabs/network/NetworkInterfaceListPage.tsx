import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { ListPageBody, ListPageCreateButton } from '@openshift-console/dynamic-plugin-sdk';

import NetworkInterfaceList from './copmonents/list/NetworkInterfaceList';
import NetworkInterfaceModal from './copmonents/modal/NetworkInterfaceModal';

import 'src/utils/styles/ListPageCreateButton.scss';

type NetworkInterfaceListPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const NetworkInterfaceListPage: React.FC<NetworkInterfaceListPageProps> = ({ obj: vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { vmi } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);
  const actionText = t('Add network interface');

  return (
    <>
      <ListPageBody>
        <ListPageCreateButton
          className="list-page-create-button-margin"
          onClick={() =>
            createModal(({ isOpen, onClose }) => (
              <NetworkInterfaceModal
                vm={vm}
                isOpen={isOpen}
                onClose={onClose}
                headerText={actionText}
                vmi={vmi}
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

export default NetworkInterfaceListPage;
