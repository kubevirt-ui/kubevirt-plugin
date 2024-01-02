import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import HorizontalNavbar from '@kubevirt-utils/components/HorizontalNavbar/HorizontalNavbar';
import { SidebarEditorProvider } from '@kubevirt-utils/components/SidebarEditor/SidebarEditorContext';
import useInstanceTypeExpandSpec from '@kubevirt-utils/resources/vm/hooks/useInstanceTypeExpandSpec';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { useVirtualMachineTabs } from './hooks/useVirtualMachineTabs';
import VirtualMachineNavPageTitle from './VirtualMachineNavPageTitle';

import './virtual-machine-page.scss';

export type VirtualMachineDetailsPageProps = {
  kind: string;
  name: string;
  namespace: string;
};

const VirtualMachineNavPage: React.FC<VirtualMachineDetailsPageProps> = ({
  kind,
  name,
  namespace,
}) => {
  const [vm] = useK8sWatchResource<V1VirtualMachine>({
    kind,
    name,
    namespace,
  });

  const [instanceTypeExpandedSpec] = useInstanceTypeExpandSpec(vm);
  const isInstanceTypeVM = !isEmpty(vm?.spec?.instancetype) || !isEmpty(vm?.spec?.preference);

  const pages = useVirtualMachineTabs();

  return (
    <SidebarEditorProvider>
      <VirtualMachineNavPageTitle
        name={name}
        vm={isInstanceTypeVM ? instanceTypeExpandedSpec : vm}
      />
      <div className="VirtualMachineNavPage--tabs__main">
        <HorizontalNavbar pages={pages} resource={vm} />
      </div>
    </SidebarEditorProvider>
  );
};

export default VirtualMachineNavPage;
