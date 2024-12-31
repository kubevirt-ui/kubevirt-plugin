import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import HorizontalNavbar from '@kubevirt-utils/components/HorizontalNavbar/HorizontalNavbar';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { SidebarEditorProvider } from '@kubevirt-utils/components/SidebarEditor/SidebarEditorContext';
import useInstanceTypeExpandSpec from '@kubevirt-utils/resources/vm/hooks/useInstanceTypeExpandSpec';
import { isInstanceTypeVM } from '@kubevirt-utils/resources/vm/utils/instanceTypes';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

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

  const [instanceTypeExpandedSpec] = useInstanceTypeExpandSpec(vm);

  const pages = useVirtualMachineTabs();

  if (!isLoaded && isEmpty(loadError)) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }
  return (
    <SidebarEditorProvider>
      <VirtualMachineNavPageTitle
        name={name}
        vm={isInstanceTypeVM(vm) ? instanceTypeExpandedSpec : vm}
      />
      <div className="VirtualMachineNavPage--tabs__main">
        <HorizontalNavbar
          instanceTypeExpandedSpec={instanceTypeExpandedSpec}
          pages={pages}
          vm={vm}
        />
      </div>
    </SidebarEditorProvider>
  );
};

export default VirtualMachineNavPage;
