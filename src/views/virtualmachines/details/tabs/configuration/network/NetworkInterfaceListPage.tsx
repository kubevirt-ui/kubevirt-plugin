import React, { FC, useCallback } from 'react';
import { RouteComponentProps } from 'react-router';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { k8sUpdate, ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem } from '@patternfly/react-core';

import AddNetworkInterfaceButton from './copmonents/AddNetworkInterfaceButton';
import NetworkInterfaceList from './copmonents/list/NetworkInterfaceList';

import 'src/utils/styles/ListPageCreateButton.scss';
import './network-interface-list-page.scss';

type NetworkInterfaceListPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const NetworkInterfaceListPage: FC<NetworkInterfaceListPageProps> = ({ obj: vm }) => {
  const onSubmit = useCallback(
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
        <SidebarEditor
          resource={vm}
          onResourceUpdate={onSubmit}
          pathsToHighlight={PATHS_TO_HIGHLIGHT.NETWORK_TAB}
        >
          <Flex>
            <FlexItem>
              <AddNetworkInterfaceButton vm={vm} />
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
