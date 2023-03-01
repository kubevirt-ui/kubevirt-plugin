import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import {
  k8sUpdate,
  ListPageBody,
  ListPageCreateButton,
} from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem } from '@patternfly/react-core';

import NetworkInterfaceList from './copmonents/list/NetworkInterfaceList';
import VirtualMachinesNetworkInterfaceModal from './copmonents/modal/VirtualMachinesNetworkInterfaceModal';

import 'src/utils/styles/ListPageCreateButton.scss';
import './network-interface-list-page.scss';

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

  const onSubmit = React.useCallback(
    (updatedVM: V1VirtualMachine) =>
      k8sUpdate({
        model: VirtualMachineModel,
        data: updatedVM,
        ns: updatedVM?.metadata?.namespace,
        name: updatedVM?.metadata?.name,
      }),
    [],
  );

  return (
    <div className="network-interface-list-page">
      <ListPageBody>
        <SidebarEditor resource={vm} onResourceUpdate={onSubmit}>
          <Flex>
            <FlexItem>
              <ListPageCreateButton
                className="list-page-create-button-margin"
                onClick={() =>
                  createModal(({ isOpen, onClose }) => (
                    <VirtualMachinesNetworkInterfaceModal
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
            </FlexItem>

            <FlexItem>
              <SidebarEditorSwitch />{' '}
            </FlexItem>
          </Flex>
          <NetworkInterfaceList vm={vm} />
        </SidebarEditor>
      </ListPageBody>
    </div>
  );
};

export default NetworkInterfaceListPage;
