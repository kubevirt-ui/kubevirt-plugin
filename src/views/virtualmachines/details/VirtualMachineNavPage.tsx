import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import HorizontalNavbar from '@kubevirt-utils/components/HorizontalNavbar/HorizontalNavbar';
import { SidebarEditorProvider } from '@kubevirt-utils/components/SidebarEditor/SidebarEditorContext';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import useInstanceTypeExpandSpec from '@kubevirt-utils/resources/vm/hooks/useInstanceTypeExpandSpec';
import { isInstanceTypeVM } from '@kubevirt-utils/resources/vm/utils/instanceTypes';
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
  const [vm, isLoaded, loadError] = useK8sWatchResource<V1VirtualMachine>({
    kind,
    name,
    namespace,
  });

  const [instanceTypeExpandedSpec, expandedSpecLoading] = useInstanceTypeExpandSpec(vm);

  const pages = useVirtualMachineTabs();

  return (
    <SidebarEditorProvider>
      <VirtualMachineNavPageTitle
        isLoaded={isLoaded || !isEmpty(loadError)}
        name={name}
        vm={isInstanceTypeVM(vm) ? instanceTypeExpandedSpec : vm}
      />
      <StateHandler error={loadError} loaded={isLoaded} withBullseye>
        <div className="VirtualMachineNavPage--tabs__main">
          <HorizontalNavbar
            expandedSpecLoading={expandedSpecLoading}
            instanceTypeExpandedSpec={instanceTypeExpandedSpec}
            pages={pages}
            vm={vm}
          />
        </div>
      </StateHandler>
    </SidebarEditorProvider>
  );
};

export default VirtualMachineNavPage;
