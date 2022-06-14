import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { HorizontalNav, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { useVirtualMachineTabs } from './hooks/useVirtualMachineTabs';
import VirtualMachineNavPageTitle from './VirtualMachineNavPageTitle';
export type VirtualMachineDetailsPageProps = {
  name: string;
  namespace: string;
  kind: string;
};

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
    <>
      <VirtualMachineNavPageTitle vm={vm} name={name} />
      <HorizontalNav pages={pages} resource={vm} />
    </>
  );
};

export default VirtualMachineNavPage;
