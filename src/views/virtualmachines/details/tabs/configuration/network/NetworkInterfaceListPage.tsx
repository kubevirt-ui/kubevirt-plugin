import React, { FC, useCallback } from 'react';
import { RouteComponentProps } from 'react-router';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { k8sUpdate, ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Title } from '@patternfly/react-core';

import AddNetworkInterfaceButton from './components/AddNetworkInterfaceButton';
import NetworkInterfaceList from './components/list/NetworkInterfaceList';

import 'src/utils/styles/ListPageCreateButton.scss';
import './network-interface-list-page.scss';

type NetworkInterfaceListPageProps = RouteComponentProps<{
  name: string;
  ns: string;
}> & {
  obj?: V1VirtualMachine;
};

const NetworkInterfaceListPage: FC<NetworkInterfaceListPageProps> = ({ obj: vm }) => {
  const { t } = useKubevirtTranslation();

  const onSubmit = useCallback(
    (updatedVM: V1VirtualMachine) =>
      k8sUpdate({
        data: updatedVM,
        model: VirtualMachineModel,
        name: updatedVM?.metadata?.name,
        ns: updatedVM?.metadata?.namespace,
      }),
    [],
  );

  return (
    <div className="network-interface-list-page">
      <ListPageBody>
        <SidebarEditor
          onResourceUpdate={onSubmit}
          pathsToHighlight={PATHS_TO_HIGHLIGHT.NETWORK_TAB}
          resource={vm}
        >
          <Title className="network-interface-list-page__title" headingLevel="h2">
            {t('Network interfaces')}
          </Title>
          <AddNetworkInterfaceButton vm={vm} />
          <NetworkInterfaceList vm={vm} />
        </SidebarEditor>
      </ListPageBody>
    </div>
  );
};

export default NetworkInterfaceListPage;
