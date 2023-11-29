import React, { FC, useCallback } from 'react';
import { RouteComponentProps } from 'react-router';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, Title } from '@patternfly/react-core';

import AddNetworkInterfaceButton from './components/AddNetworkInterfaceButton';
import NetworkInterfaceList from './components/list/NetworkInterfaceList';

import 'src/utils/styles/ListPageCreateButton.scss';
import './network-tab.scss';

type NetworkTabProps = RouteComponentProps<{
  name: string;
  ns: string;
}> & {
  obj?: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const NetworkTab: FC<NetworkTabProps> = ({ obj: vm, vmi }) => {
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
    <>
      <SidebarEditor
        onResourceUpdate={onSubmit}
        pathsToHighlight={PATHS_TO_HIGHLIGHT.NETWORK_TAB}
        resource={vm}
      >
        <PageSection>
          <Title headingLevel="h2">{t('Network')}</Title>
          <AddNetworkInterfaceButton vm={vm} vmi={vmi} />
          <NetworkInterfaceList vm={vm} vmi={vmi} />
        </PageSection>
      </SidebarEditor>
    </>
  );
};

export default NetworkTab;
