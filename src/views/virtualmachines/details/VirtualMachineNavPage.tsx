import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { SidebarEditorProvider } from '@kubevirt-utils/components/SidebarEditor/SidebarEditorContext';
import { HorizontalNav, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { useVirtualMachineTabs } from './hooks/useVirtualMachineTabs';
import VirtualMachineNavPageTitle from './VirtualMachineNavPageTitle';
export type VirtualMachineDetailsPageProps = {
  name: string;
  namespace: string;
  kind: string;
};
import './virtual-machine-page.scss';

const VirtualMachineNavPage: React.FC<VirtualMachineDetailsPageProps> = ({
  name,
  namespace,
  kind,
}) => {
  const [vm] = useK8sWatchResource<V1VirtualMachine>({
    kind,
    name,
    namespace,
  });
  const pages = useVirtualMachineTabs();
  return (
    <SidebarEditorProvider>
      <VirtualMachineNavPageTitle vm={vm} name={name} />
      <div className="VirtualMachineNavPage--tabs__main">
        <HorizontalNav pages={pages} resource={vm} />
      </div>
    </SidebarEditorProvider>
  );
};

export default VirtualMachineNavPage;
